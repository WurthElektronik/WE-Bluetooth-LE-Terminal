import { Component, NgZone } from '@angular/core';
import { StatusBar,Style } from '@capacitor/status-bar';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { Globalization } from '@awesome-cordova-plugins/globalization/ngx';
import {  Platform } from '@ionic/angular';
import { BleService } from './services/ble.service';
import { CapacitorException } from '@capacitor/core';
import { BleClient } from '@capacitor-community/bluetooth-le';

enum AppState {
  NotSupported = "NotSupported",
  BluetoothNotEnabled = "BluetoothNotEnabled",
  BluetoothNoPermissions = "BluetoothNoPermissions",
  Valid = "Valid"
}  

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {

  public state:AppState = AppState.Valid;

  constructor(public ble:BleService, private ngZone: NgZone,private router: Router, private translate: TranslateService, private globalization: Globalization, public platform: Platform ) {}
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
    try {
      await BleClient.initialize({ androidNeverForLocation: true });
    } catch (error) {
      if(error instanceof CapacitorException)
      {
        switch(error.message)
        {
          case "BLE permission denied":
          case "Permission denied.":
            this.state = AppState.BluetoothNoPermissions;
            await BleClient.openAppSettings();
            break;
          default:
      this.state = AppState.NotSupported;
            break;
        }
      }else{
        this.state = AppState.NotSupported;
      }
      return;
    }

    if(await BleClient.isEnabled() == false){
      this.state = AppState.BluetoothNotEnabled;
    }

    await BleClient.startEnabledNotifications((state) => {
      this.ngZone.run(() => {
        if(state){
          this.state = AppState.Valid;
        }else{
          this.state = AppState.BluetoothNotEnabled;
        }
      }); 
    });
  }
}