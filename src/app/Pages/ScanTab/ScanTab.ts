import { Component, NgZone, ViewChild } from '@angular/core';
import { BleService } from '../../services/ble.service';
import { BleClient, BleDevice, ScanResult } from '@capacitor-community/bluetooth-le';
import { Router } from '@angular/router';
import { IonSelect, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ScanSort } from './ScanSort';
import { ModalController } from '@ionic/angular';
import { SelectModuleComponent } from 'src/app/Components/select-module/select-module.component';
import { environment } from '../../../environments/environment';
import { testdevice, testscanresult } from 'src/app/TestDevice/TestBLEDevice';
import { TestModule } from 'src/app/TestDevice/TestModule';
import { Device } from '@capacitor/device';
import { ScanFilter } from 'src/app/Filters/ScanFilter';
import { AddFilterComponent } from 'src/app/Components/add-filter/add-filter.component';
import { FilterType } from 'src/app/Filters/FilterType';
import { ServiceUUIDFilter } from 'src/app/Filters/ServiceUUIDFilter';
import { Subscription } from 'rxjs';
import { WESPPProfile } from 'src/app/BLEProfiles/WESPPProfile';

@Component({
  selector: 'app-scantab',
  templateUrl: 'ScanTab.html',
  styleUrls: ['ScanTab.scss']
})

export class ScanTab {
  scanning:boolean = false;
  scantext:String = "startscantext";
  scanresults:ScanResult[] = [];
  paireddevices:BleDevice[] = [];
  scanSortType:string = ScanSort[ScanSort.Default];
  connecting:Boolean = false;
  connectingdeviceid:string = undefined;
  scanfilters:Map<FilterType,ScanFilter> = new Map<FilterType,ScanFilter>([
    [FilterType.ServiceUUID, new ServiceUUIDFilter(WESPPProfile)]
  ]);

  private disconnectsubscription: Subscription;

  @ViewChild('scanselect') select: IonSelect;
  
  constructor(public ble:BleService, private ngZone: NgZone, private router: Router, public platform: Platform, private translateService: TranslateService, private modalCtrl: ModalController ,private toastController: ToastController ) {}

  async ngOnInit(){
    this.translateService.onLangChange.subscribe(() => {
      this.translateService.get("ScanTab.scansorttype." + this.scanSortType.toLowerCase()).subscribe(async (res: string) => {
        this.select.selectedText = res;
      });
    });
    if(!environment.production){
      if(this.platform.is('desktop')){
        this.paireddevices.push(testdevice);
      }else{
        this.scanresults.push(testscanresult);
      }
    }
    if(this.platform.is('electron')){
      (window as any).capacitorionicbluetooth.scanCancelled(() => {
        this.ngZone.run(() => {
          this.stopscan();
        });
      });
    }
  }

  ionViewWillEnter(){
    this.disconnectsubscription = this.ble.onDeviceDisconnected.subscribe(async (disconnecteddeviceid:string) => {
      this.ngZone.run(() => {
        if(this.connecting && (this.connectingdeviceid == disconnecteddeviceid))
        {
          this.connectingdeviceid = undefined;
          this.connecting = false;
        }
      });
    });
  }

  ionViewWillLeave() {
    this.disconnectsubscription.unsubscribe();
    this.disconnectsubscription = undefined;
  }

  ionViewDidEnter(){
      this.scanning = false;
      this.scantext = "startscantext";
  }

  async ionViewDidLeave(){
    if(!this.platform.is('desktop')){
      this.stopscan();
    }
  }

  scanclick(){
    this.scanning ? this.stopscan() : this.scan();
  }

  clearscan(){
    this.paireddevices = [];
    if(!environment.production){
      this.paireddevices.push(testdevice);
    }
  }

  async scan(){

    //check for location on android 11 or less
    if(this.platform.is('android') && ((await Device.getInfo()).androidSDKVersion <= 30) && await BleClient.isLocationEnabled() == false){
      this.translateService.get('locationoff').subscribe(async (res: string) => {
        const toast = await this.toastController.create({
          message: res,
          duration: 500,
          position: 'middle',
          cssClass: 'toastwidth'
        });
        toast.present();
      });
      return;
    }

    this.scanning = true;
    this.scantext = "stopscantext";
    this.scanresults = [];
    if(!environment.production){
      this.scanresults.push(testscanresult);
    }
    if(this.platform.is('desktop')){
      if(this.platform.is('electron')){
        (window as any).capacitorionicbluetooth.startScan();
      }
      this.ble.requestdevice(this.scanfilters,(result) => {
        if(result != undefined && this.paireddevices.filter(paireddevice => paireddevice.deviceId == result.deviceId).length == 0){
          this.paireddevices.push(result);
          this.sort();
        }
        if((result != undefined) || !this.platform.is('electron')){
          this.stopscan();
        }
      })
    }else{
      this.ble.startscan(this.scanfilters,(result) => {
        this.ngZone.run(() => {
          this.scanresults.push(result);
          this.sort();
        });
      });
    }
  }

  async stopscan(){
    this.scanning = false;
    this.scantext = "startscantext";
    if(this.platform.is('electron')){
        (window as any).capacitorionicbluetooth.stopScan();
    }else if(!this.platform.is('desktop')){
      await this.ble.stopscan();
    }
  }

  async scanitemclick(item:ScanResult){
    if(!environment.production && item.device == testdevice && !this.ble.connectedDevices.has(item.device.deviceId)){
      this.ble.connectedDevices.set(item.device.deviceId, new TestModule(item.device));
      await this.ble.connectedDevices.get(item.device.deviceId).initializeModule();
    }else{
      this.connect(item.device);
    }
  }

  async paireddeviceclick(item:BleDevice){
    if(!environment.production && item == testdevice && !this.ble.connectedDevices.has(item.deviceId)){
      this.ble.connectedDevices.set(item.deviceId, new TestModule(item));
      await this.ble.connectedDevices.get(item.deviceId).initializeModule();
    }else{
      this.connect(item);
    }
  }

  async refresh(event){
    event.target.complete();
    setTimeout(async () => {
      await this.scan();
    },250);
  }

  async sortTypeChanged(event){
    this.select.selectedText = undefined;
    this.scanSortType = event.detail.value;
    this.sort();
  }

  sort(){
    if(this.platform.is('desktop')){
      switch(ScanSort[this.scanSortType]){
        case ScanSort.Name:
          this.paireddevices.sort((a, b) => a.name.localeCompare(b.name));
          return;
        case ScanSort.Address:
          this.paireddevices.sort((a, b) => a.deviceId.localeCompare(b.deviceId));
          return;
        case ScanSort.Default:
        default:
          return;
      }
    }else{
      switch(ScanSort[this.scanSortType]){
        case ScanSort.Name:
          this.scanresults.sort((a, b) => a.localName.localeCompare(b.localName));
          return;
        case ScanSort.Address:
          this.scanresults.sort((a, b) => a.device.deviceId.localeCompare(b.device.deviceId));
          return;
        case ScanSort.RSSI:
          this.scanresults.sort((a, b) => (a.rssi > b.rssi) ? -1 : 1);
          return;
        case ScanSort.Default:
        default:
          return;
      }
    }
  }

  loadingdismiss(){
    if(this.ble.connectedDevices.has(this.connectingdeviceid)){
      this.router.navigate(
        ['/tabs/terminal'],
        { 
          queryParams: { deviceid: this.connectingdeviceid}
        }
      );
    }
    this.connectingdeviceid = undefined
  }

  async connect(device:BleDevice){

    if(!this.ble.connectedDevices.has(device.deviceId)){
      const modal = await this.modalCtrl.create({
        component: SelectModuleComponent,
      });
      modal.cssClass = 'auto-height';
      modal.animated = false;
      modal.present();
  
      const { data, role } = await modal.onWillDismiss();
  
      if (role === 'confirm') {
        this.connectingdeviceid = device.deviceId;
        this.connecting = true;
        try {
            await this.ble.connect(device, data['selectedmodule'], data['selectedDataMode']);
            this.connecting = false;
        } catch (error) {
          this.connectingdeviceid = undefined;
          this.connecting = false;
          this.translateService.get('ScanTab.connectionfailed').subscribe(async (res: string) => {
            const toast = await this.toastController.create({
              message: res,
              duration: 500,
              position: 'middle',
              cssClass: 'toastwidth'
            });
            toast.present();
          });
        }
      }
    }else{
      this.router.navigate(
        ['/tabs/terminal'],
        { 
          queryParams: { deviceid: device.deviceId}
        }
      );
    }

  }

  async addFilter(){
    const modal = await this.modalCtrl.create({
      component: AddFilterComponent,
    });
    modal.cssClass = 'auto-height';
    modal.animated = false;
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      let newFilter:ScanFilter = data;
      this.scanfilters.set(newFilter.getType(),newFilter);
    }
  }

  deleteFilter(filterType:FilterType){
    this.scanfilters.delete(filterType);
  }

}
