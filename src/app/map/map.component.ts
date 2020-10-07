import {AfterViewInit, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import {MapPolygon} from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldHigh';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import {MenuItem} from './menuItem';
import {MenuType} from './menuType';
import {CountryService} from '../services/country.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private chart: am4maps.MapChart;

  modal = false;
  menu = false;
  menuItems: MenuItem[] = [
    {
      name: 'İhracat Yap',
      icon: 'factory',
      type: MenuType.EXPORT
    }, {
      name: 'İthalat Yap',
      icon: 'store',
      type: MenuType.IMPORT
    }, {
      name: 'Not Ekle',
      icon: 'highlighter',
      type: MenuType.NOTE
    }, {
      name: 'Bilgileri Sil',
      icon: 'trash',
      type: MenuType.DELETE
    },
  ];
  target: MapPolygon;
  note: string;
  x: string;
  y: string;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone, private chgRef: ChangeDetectorRef, private countryService: CountryService) {
  }

  // Run the function only in the browser
  browserOnly(f: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      const chart = am4core.create('chartdiv', am4maps.MapChart);
      chart.geodata = am4geodata_worldLow;
      chart.projection = new am4maps.projections.Miller();
      chart.smallMap = new am4maps.SmallMap();
      chart.smallMap.align = 'right';
      chart.smallMap.valign = 'top';
      chart.zoomControl = new am4maps.ZoomControl();
      chart.events.on('hit', ev => {
        this.menu = false;
        this.chgRef.detectChanges();
      });

      const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
      chart.smallMap.series.push(polygonSeries);
      polygonSeries.useGeodata = true;
      polygonSeries.exclude = ['AQ'];

      const polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.applyOnClones = true;
      polygonTemplate.togglable = true;
      polygonTemplate.tooltipText = '{name}';
      polygonTemplate.nonScalingStroke = true;
      polygonTemplate.strokeOpacity = 0.5;
      polygonTemplate.contextMenuDisabled = true;
      polygonTemplate.wheelable = true;
      polygonTemplate.fill = chart.colors.getIndex(0);
      let lastSelected;

      polygonTemplate.events.on('hit', ev => {
        if (lastSelected) {
          lastSelected.isActive = false;
        }
        ev.target.series.chart.zoomToMapObject(ev.target);
        if (lastSelected !== ev.target) {
          lastSelected = ev.target;
        }
      }, this);

      polygonTemplate.events.on('over', ev => {
        const {id} = ev.target.dataItem.dataContext as any;
        const {type} = this.countryService.countries[id];
        if (type) {
        } else {
          ev.target.fill = chart.colors.getIndex(2);
        }
      }, this);
      polygonTemplate.events.on('out', ev => {
        const {id} = ev.target.dataItem.dataContext as any;
        const {type} = this.countryService.countries[id];
        console.log(type);
        if (type) {
        } else {
          ev.target.fill = chart.colors.getIndex(0);
        }
      }, this);

      polygonTemplate.events.on('rightclick', (ev) => {
        this.menu = true;
        this.target = ev.target;
        // @ts-ignore
        const {clientX, clientY} = ev.event;
        this.x = `${clientX}px`;
        this.y = `${clientY}px`;

        this.chgRef.detectChanges();
      }, this);

      /*
            const ss = polygonTemplate.states.create('active');
            ss.properties.fill = chart.colors.getIndex(2);

            const hs = polygonTemplate.states.create('hover');
            hs.properties.fill = chart.colors.getIndex(4);
      */


      /*
      const homeButton = new am4core.Button();
      homeButton.events.on('hit', () => {
        chart.goHome();
      });
homeButton.icon = new am4core.Sprite();
      homeButton.padding(7, 5, 7, 5);
      homeButton.width = 30;
      homeButton.icon.path = 'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8';
      homeButton.marginBottom = 10;
      homeButton.parent = chart.zoomControl;
      homeButton.insertBefore(chart.zoomControl.plusButton);*/

      this.chart = chart;
    });
  }

  ngOnDestroy(): void {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  menuClick(e: any, target: MapPolygon, type: MenuType): void {
    if (target.constructor.name === 'MapPolygon') {
      const {id} = target.dataItem.dataContext as any;
      switch (type) {
        case MenuType.EXPORT:
          target.fill = am4core.color('#00ff00');
          this.countryService.setCountryType(id, type);
          break;
        case MenuType.IMPORT:
          target.fill = am4core.color('#ff0000');
          this.countryService.setCountryType(id, type);
          break;
        case MenuType.NOTE:
          this.modal = true;
          this.countryService.setCountryNote(id, '');
          break;
        case MenuType.DELETE:
          target.fill = this.chart.colors.getIndex(0);
          this.countryService.setCountryClear(id);
          break;
        default:
          break;
      }
    }
    this.menu = false;
  }
}
