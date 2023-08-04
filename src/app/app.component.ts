import { Component } from '@angular/core';
import { StatusBar,Style } from '@capacitor/status-bar';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { Globalization } from '@awesome-cordova-plugins/globalization/ngx';
import {  Platform } from '@ionic/angular';
import { BleService } from './services/ble.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public isBluetoothInitialized:Boolean = true;

  constructor(public ble:BleService,private router: Router, private translate: TranslateService, private globalization: Globalization, public platform: Platform ) {}
  async ngOnInit(){
    this.translate.setDefaultLang('en');
    let preflanguage =  await Preferences.get({ key: 'preflang' });
    if(preflanguage.value == null){
      this.globalization.getPreferredLanguage()
      .then(res => {
          this.translate.use(res.value.split("-")[0]);
      })
      .catch(e => {
  
      });
    }else{
      this.translate.use(preflanguage.value);
    }

    if(!this.platform.is('desktop')){
      StatusBar.setBackgroundColor({
        color: "#e3000b"
      }).catch((error) => {
  
      });
      StatusBar.setStyle({ style: Style.Dark });
    }

    let firsttime =  await Preferences.get({ key: 'firsttime' });
    if(firsttime.value == null){
      this.router.navigate(
        ['/policy']
      );
    }else{
      this.router.navigate(
        ['/tabs/scan']
      );
    }
    this.isBluetoothInitialized = await this.ble.initializeble();
  }
}