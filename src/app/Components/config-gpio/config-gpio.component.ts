import { Component, NgZone, OnInit,ViewChild,ElementRef } from '@angular/core';
import { IonInput, IonSelect, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GPIO } from 'src/app/BLEModules/GPIO/GPIO';
import { GPIOInputPinType } from 'src/app/BLEModules/GPIO/GPIOInputPinType';
import { GPIOInterface } from 'src/app/BLEModules/GPIO/GPIOInterface';
import { GPIOOutputPinType } from 'src/app/BLEModules/GPIO/GPIOOutputPinType';
import { GPIOPinType } from 'src/app/BLEModules/GPIO/GPIOPinType';
import { GeneralBLEModule } from 'src/app/BLEModules/GeneralBLEModule';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-config-gpio',
  templateUrl: './config-gpio.component.html',
  styleUrls: ['./config-gpio.component.scss'],
})
export class ConfigGpioComponent implements OnInit {
  public id:string;
  public device:GeneralBLEModule;
  public gpio:GPIO;
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
    this.device = this.ble.connectedDevices.get(this.id);
    this.gpio = (<GPIOInterface><unknown>this.device).getGPIO();
    this.selectedpin = String(this.gpio.getGPIOPins().keys().next().value);
    this.gpio.resetTempGPIOPins(Array.from(this.gpio.getTempGPIOPins().values()));
    this.datareceivedsubscription = this.device.getDataReceivedSubject().subscribe(async () => {
      this.ngZone.run(() => {
        this.select.value = GPIOPinType[this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinType()];
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
    await this.ble.senddataunformatted(this.id, (<GPIOInterface><unknown>this.device).formatreadpinconfiguration());
  }

  async writeallpinconfig(){
    await this.ble.senddataunformatted(this.id, (<GPIOInterface><unknown>this.device).formatwritepinconfiguration(Array.from(this.gpio.getTempGPIOPins().values())));
  }

  async writepinconfig(){
    await this.ble.senddataunformatted(this.id, (<GPIOInterface><unknown>this.device).formatwritepinconfiguration([this.gpio.getTempGPIOPins().get(+this.selectedpin)]));
  }

  pinchanged(pinid:number){
    this.ngZone.run(() => {
      this.select.value = GPIOPinType[this.gpio.getTempGPIOPins().get(pinid).getPinType()];
    });
  }

  pinTypeChanged(event){
    this.gpio.getTempGPIOPins().get(+this.selectedpin).setPinType(GPIOPinType[<string>event.detail.value]);
    this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint32(0,0);
    if(this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinType() == GPIOPinType.PWM){
      this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint16(0,1);
    }
  }

  backclicked(){
    return this.modalCtrl.dismiss('confirm');
  }

  pwmRatioformatter(value: number) {
    return `${value}%`;
  }

  pwmRatioChanged(event){
    this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint8(2,(event.detail.value * 254/100));
  }

  inputTypeChanged(event){
    this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint8(0,GPIOInputPinType[<string>event.detail.value]);
  }

  outputTypeChanged(event){
    this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint8(0,GPIOOutputPinType[<string>event.detail.value]);
  }

  onpwmPeriodInput(event){
    let value:string = event.detail.value;
    let filteredValue:string = value.replace(/[^0-9]+/g, '');
    this.pwmperiod.value = filteredValue;
  }

  onpwmPeriodChange(event){
    let value:number = +event.detail.value;
    if(value <= 1){
      this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint16(0,1);
      this.pwmperiod.value = 1;
    }else if(value >= 500){
      this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint16(0,500);
      this.pwmperiod.value = 500;
    }else{
      this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinConfigValue().setUint16(0,value);
    }
  }

}
