import {Component, OnInit} from '@angular/core';
import {FacebookLoginProvider, SocialAuthService, SocialUser} from 'social-login';
import {CountryService} from './services/country.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  user: SocialUser;
  countries: Array<any>;

  constructor(private authService: SocialAuthService, private countryService: CountryService) {
    this.countries = _.map(this.countryService.countries, (value, id) => ({id, ...value}));

    console.log(this.countries);
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
