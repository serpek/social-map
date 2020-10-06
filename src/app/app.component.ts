import {Component, OnInit} from '@angular/core';
import {FacebookLoginProvider, SocialAuthService, SocialUser} from 'social-login';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  user: SocialUser;

  constructor(private authService: SocialAuthService) {
  }

  ngOnInit(): void {
    this.authService.authState.subscribe(user => {
      this.user = user;
    });

    setTimeout(() => {
      this.signInWithFB();
    }, 1000);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
  }

}
