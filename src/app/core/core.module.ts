import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CountryService} from '../services/country.service';
import {FacebookLoginProvider, SocialAuthModule, SocialAuthServiceConfig} from 'social-login';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SocialAuthModule
  ],
  providers: [
    CountryService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: true,
        providers: [
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('784204875698665'),
          }
        ],
      } as SocialAuthServiceConfig,
    }
  ]
})
export class CoreModule { }
