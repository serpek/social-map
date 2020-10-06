import {Inject, Injectable} from '@angular/core';
import {AsyncSubject, Observable, ReplaySubject} from 'rxjs';
import {LoginProvider} from './entities/login-provider';
import {SocialUser} from './entities/social-user';

export interface SocialAuthServiceConfig {
  autoLogin?: boolean;
  providers: { id: string; provider: LoginProvider }[];

  onError?(error: any): void;
}

@Injectable()
export class SocialAuthService {
  private static readonly ERR_LOGIN_PROVIDER_NOT_FOUND = 'Login provider not found';
  private static readonly ERR_NOT_LOGGED_IN = 'Not logged in';
  private static readonly ERR_NOT_INITIALIZED = 'Login providers not ready yet. Are there errors on your console?';

  private providers: Map<string, LoginProvider> = new Map();
  private autoLogin = false;

  private $user: SocialUser = null;
  private $authState: ReplaySubject<SocialUser> = new ReplaySubject(1);

  private initialized = false;
  private $initState: AsyncSubject<boolean> = new AsyncSubject();

  get authState(): Observable<SocialUser> {
    return this.$authState.asObservable();
  }

  get initState(): Observable<boolean> {
    return this.$initState.asObservable();
  }

  constructor(
    @Inject('SocialAuthServiceConfig')
      config: SocialAuthServiceConfig | Promise<SocialAuthServiceConfig>,
  ) {
    if (config instanceof Promise) {
      config.then((config: SocialAuthServiceConfig) => {
        this.initialize(config);
      });
    } else {
      this.initialize(config);
    }
  }

  private initialize(config: SocialAuthServiceConfig): void {
    this.autoLogin = config.autoLogin !== undefined ? config.autoLogin : false;

    config.providers.forEach((item) => {
      this.providers.set(item.id, item.provider);
    });

    Promise.all(
      Array.from(this.providers.values()).map((provider) =>
        provider.initialize(),
      ),
    )
      .then(() => {
        this.initialized = true;
        this.$initState.next(this.initialized);
        this.$initState.complete();

        if (this.autoLogin) {
          const loginStatusPromises = [];
          let loggedIn = false;

          this.providers.forEach((provider: LoginProvider, key: string) => {
            const promise = provider.getLoginStatus();
            loginStatusPromises.push(promise);
            promise
              .then((user: SocialUser) => {
                user.provider = key;

                this.$user = user;
                this.$authState.next(user);
                loggedIn = true;
              })
              .catch(console.error);
          });
          Promise.all(loginStatusPromises).catch(() => {
            if (!loggedIn) {
              this.$user = null;
              this.$authState.next(null);
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
        if (config.onError) {
          config.onError(error);
        }
      });
  }

  signIn(providerId: string, signInOptions?: any): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(SocialAuthService.ERR_NOT_INITIALIZED);
      } else {
        const providerObject = this.providers.get(providerId);
        if (providerObject) {
          providerObject
            .signIn(signInOptions)
            .then((user: SocialUser) => {
              user.provider = providerId;
              resolve(user);

              this.$user = user;
              this.$authState.next(user);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }

  signOut(revoke: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(SocialAuthService.ERR_NOT_INITIALIZED);
      } else if (!this.$user) {
        reject(SocialAuthService.ERR_NOT_LOGGED_IN);
      } else {
        const providerId = this.$user.provider;
        const providerObject = this.providers.get(providerId);
        if (providerObject) {
          providerObject
            .signOut(revoke)
            .then(() => {
              resolve();

              this.$user = null;
              this.$authState.next(null);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }
}
