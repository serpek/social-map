import {AfterViewInit, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private chart: am4maps.MapChart;

  menu = false;
  menuContext: any;
  x: string;
  y: string;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone, private chgRef: ChangeDetectorRef) {
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
      polygonTemplate.events.on('rightclick', (ev) => {
        this.menu = true;
        this.menuContext = ev.target.dataItem.dataContext;
        // @ts-ignore
        const {clientX, clientY} = ev.event;
        this.x = `${clientX}px`;
        this.y = `${clientY}px`;

        this.chgRef.detectChanges();
        console.log(ev, this, ev.target.dataItem.dataContext);
      }, this);


      const ss = polygonTemplate.states.create('active');
      ss.properties.fill = chart.colors.getIndex(2);

      const hs = polygonTemplate.states.create('hover');
      hs.properties.fill = chart.colors.getIndex(4);


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

  menuClick(e: any, context: any): void {
    console.log(e, context);
  }
}
