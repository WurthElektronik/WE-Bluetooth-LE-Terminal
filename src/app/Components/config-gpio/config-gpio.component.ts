import { Component, NgZone, OnInit,ViewChild,ElementRef } from '@angular/core';
import { IonInput, IonSelect, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GPIOInputPinType } from 'src/app/BLEModules/GPIO/GPIOInputPinType';
import { GPIOOutputPinType } from 'src/app/BLEModules/GPIO/GPIOOutputPinType';
import { GPIOPinType } from 'src/app/BLEModules/GPIO/GPIOPinType';
import { GeneralBLEGPIOModule } from 'src/app/BLEModules/GPIO/GeneralBLEGPIOModule';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-config-gpio',
  templateUrl: './config-gpio.component.html',
  styleUrls: ['./config-gpio.component.scss'],
})
export class ConfigGpioComponent implements OnInit {
  public id:string;
  public device:GeneralBLEGPIOModule;
  public selectedpin:string;
  public pinTypes = GPIOPinType;
  public inputPinTypes = GPIOInputPinType;
  public outputPinTypes = GPIOOutputPinType;
  private datareceivedsubscription: Subscription;
  public pwmratioValue:number;

  constructor(public ble:BleService,private modalCtrl: ModalController,private ngZone: NgZone) { }
  
  @ViewChild('pintypeselect') select: IonSelect;
  @ViewChild('pwmperiod') pwmperiod: IonInput;

  ngOnInit() {
    this.device = <GeneralBLEGPIOModule>this.ble.connectedDevices.get(this.id);
    this.selectedpin = String(this.device.getGPIOPins().keys().next().value);
    this.device.resetTempGPIOPins(Array.from(this.device.getTempGPIOPins().values()));
    this.datareceivedsubscription = this.device.getDataReceivedSubject().subscribe(async () => {
      this.ngZone.run(() => {
        this.select.value = GPIOPinType[this.device.getTempGPIOPins().get(+this.selectedpin).getPinType()];
      }); // needed to make sure changes are reflected in the UI
    });
  }

  ionViewWillLeave() {
    if(this.datareceivedsubscription){
      this.datareceivedsubscription.unsubscribe();
      this.datareceivedsubscription = undefined;
    }
  }


  async readpinconfig(){
    await this.ble.senddataunformatted(this.id, this.device.formatreadpinconfiguration());
  }

  async writeallpinconfig(){
    await this.ble.senddataunformatted(this.id, this.device.formatwritepinconfiguration(Array.from(this.device.getTempGPIOPins().values())));
  }

  async writepinconfig(){
    await this.ble.senddataunformatted(this.id, this.device.formatwritepinconfiguration([this.device.getTempGPIOPins().get(+this.selectedpin)]));
  }

  pinchanged(pinid:number){
    this.ngZone.run(() => {
      this.select.value = GPIOPinType[this.device.getTempGPIOPins().get(pinid).getPinType()];
    });
  }

  pinTypeChanged(event){
    this.device.getTempGPIOPins().get(+this.selectedpin).setPinType(GPIOPinType[<string>event.detail.value]);
    this.device.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint32(0,0);
    if(this.device.getTempGPIOPins().get(+this.selectedpin).getPinType() == GPIOPinType.PWM){
      this.device.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint16(0,1);
    }
  }

  backclicked(){
    return this.modalCtrl.dismiss('confirm');
  }

  pwmRatioformatter(value: number) {
    return `${value}%`;
  }

  pwmRatioChanged(event){
    this.device.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint8(2,(event.detail.value * 254/100));
  }

  inputTypeChanged(event){
    this.device.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint8(0,GPIOInputPinType[<string>event.detail.value]);
  }

  outputTypeChanged(event){
    this.device.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint8(0,GPIOOutputPinType[<string>event.detail.value]);
  }

  onpwmPeriodInput(event){
    let value:string = event.detail.value;
    let filteredValue:string = value.replace(/[^0-9]+/g, '');
    this.pwmperiod.value = filteredValue;
  }

  onpwmPeriodChange(event){
    let value:number = +event.detail.value;
    if(value <= 1){
      this.device.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint16(0,1);
      this.pwmperiod.value = 1;
    }else if(value >= 500){
      this.device.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint16(0,500);
      this.pwmperiod.value = 500;
    }else{
      this.device.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint16(0,value);
    }
  }

}
