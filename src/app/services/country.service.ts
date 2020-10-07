import {Injectable} from '@angular/core';
import countries2 from '@amcharts/amcharts4-geodata/data/countries2';
import {BindObservable} from 'bind-observable';
import {Observable} from 'rxjs';
import {Country2} from '@amcharts/amcharts4-geodata/.internal/Data';
import {MenuType} from '../map/menuType';

const continents: { [key: string]: string[] } = {
  africa: ['AO', 'BF', 'BI', 'BJ', 'BW', 'CD', 'CF', 'CG', 'CI', 'CM', 'DJ', 'DZ', 'EG', 'ER', 'ET', 'GA', 'GH', 'GM', 'GN', 'GQ', 'GW', 'KE', 'LR', 'LS', 'LY', 'MA', 'MU', 'MG', 'ML', 'MR', 'MW', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'SD', 'SL', 'SN', 'SO', 'SS', 'SZ', 'TD', 'TG', 'TN', 'TZ', 'UG', 'ZA', 'ZM', 'ZW', 'EH', 'KM', 'GO', 'JU', 'SH', 'ST', 'YT', 'BV', 'CV', 'SC'],
  asia: ['AE', 'AF', 'BD', 'BN', 'IO', 'BT', 'CN', 'ID', 'IL', 'IN', 'IQ', 'IR', 'JO', 'JP', 'KG', 'KH', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LK', 'MO', 'MM', 'MN', 'MY', 'NP', 'OM', 'PH', 'PK', 'PS', 'QA', 'SA', 'SY', 'TH', 'TJ', 'TL', 'TM', 'TW', 'UZ', 'VN', 'YE', 'HK', 'MV', 'BH', 'SG'],
  europe: ['AL', 'AM', 'AT', 'AZ', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'JE', 'FI', 'FR', 'GB', 'GE', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LT', 'LU', 'LV', 'MD', 'ME', 'MK', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SJ', 'SK', 'TR', 'UA', 'RU', 'VA', 'MT', 'MC', 'XK', 'LI', 'IM', 'GI', 'FO', 'AD', 'AX', 'GG', 'SM'],
  northAmerica: ['BS', 'BZ', 'CA', 'CR', 'CU', 'DO', 'GL', 'GT', 'HN', 'HT', 'JM', 'MX', 'NI', 'PA', 'PR', 'SV', 'US', 'AG', 'AW', 'BB', 'BL', 'GD', 'KN', 'LC', 'MQ', 'TC', 'VG', 'AI', 'BM', 'DM', 'PM', 'GP', 'KY', 'MF', 'MS', 'SX', 'TT', 'VC', 'VI', 'BQ', 'CW'],
  southAmerica: ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'FK', 'GF', 'GY', 'PE', 'PY', 'SR', 'UY', 'VE', 'GS'],
  oceania: ['AS', 'AU', 'UM-FQ', 'CC', 'CX', 'FJ', 'FM', 'GU', 'HM', 'UM-HQ', 'UM-DQ', 'UM-JQ', 'KI', 'MH', 'UM-MQ', 'MP', 'NC', 'NF', 'NR', 'NU', 'NZ', 'PG', 'PW', 'SB', 'TF', 'TK', 'TL', 'TO', 'TV', 'VU', 'UM-WQ', 'WF', 'WS', 'CK', 'PF', 'PN']
};

type Country = Country2 & { type?: MenuType, note?: string };

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  @BindObservable()
  public countries: { [key: string]: Country } = countries2;
  public countries$!: Observable<string>;

  constructor() {
  }

  setCountryNote(id: string, note: string): void {
    if (this.countries.hasOwnProperty(id)) {
      this.countries[id].note = note;
    }
  }

  setCountryType(id: string, type: MenuType): void {
    if (this.countries.hasOwnProperty(id)) {
      this.countries[id].type = type;
    }
  }

  setCountryClear(id: string): void {
    if (this.countries.hasOwnProperty(id)) {
      this.countries[id].note = null;
      this.countries[id].type = null;
    }
  }
}
