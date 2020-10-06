import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SocialAuthService, SocialAuthServiceConfig} from './social-auth.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    SocialAuthService
  ]
})
export class SocialAuthModule {
  public static initialize(config: SocialAuthServiceConfig): ModuleWithProviders<SocialAuthModule> {
    return {
      ngModule: SocialAuthModule,
      providers: [
        SocialAuthService,
        {
          provide: 'SocialAuthServiceConfig',
          useValue: config
        }
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: SocialAuthModule) {
    if (parentModule) {
      throw new Error(
        'SocialLoginModule is already loaded. Import it in the AppModule only');
    }
  }
}
