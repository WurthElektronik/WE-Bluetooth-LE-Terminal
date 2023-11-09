import { Component, NgZone, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GPIO } from 'src/app/BLEModules/GPIO/GPIO';
import { GPIOInputPinType } from 'src/app/BLEModules/GPIO/GPIOInputPinType';
import { GPIOInterface } from 'src/app/BLEModules/GPIO/GPIOInterface';
import { GPIOOutputPinType } from 'src/app/BLEModules/GPIO/GPIOOutputPinType';
import { GPIOPin } from 'src/app/BLEModules/GPIO/GPIOPin';
import { GPIOPinType } from 'src/app/BLEModules/GPIO/GPIOPinType';
import { GeneralBLEModule } from 'src/app/BLEModules/GeneralBLEModule';
import { Proteus } from 'src/app/BLEModules/Proteus/Proteus';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-rw-gpio',
  templateUrl: './rw-gpio.component.html',
  styleUrls: ['./rw-gpio.component.scss'],
})
export class RwGpioComponent implements OnInit {
  public id:string;
  public device:GeneralBLEModule;
  public gpio:GPIO;
  public selectedpin:string;
  public pinTypes = GPIOPinType;
  public inputPinTypes = GPIOInputPinType;
  public outputPinTypes = GPIOOutputPinType;
  private datareceivedsubscription: Subscription;
  public pwmratioValue:number;
  public isPinConfigured:Boolean = false;

  constructor(public ble:BleService,private modalCtrl: ModalController,private ngZone: NgZone) { }

  ngOnInit() {
    this.device = <GeneralBLEModule>this.ble.connectedDevices.get(this.id);
    this.gpio = (<GPIOInterface><unknown>this.device).getGPIO();
    this.selectedpin = String(this.gpio.getGPIOPins().keys().next().value);
    this.gpio.resetTempGPIOPins(Array.from(this.gpio.getTempGPIOPins().values()));
    this.isPinConfigured = Array.from(this.gpio.getTempGPIOPins().values()).filter(pin => pin.getIsConfigured() == true).length != 0;
    this.datareceivedsubscription = this.device.getDataReceivedSubject().subscribe(async () => {
      this.ngZone.run(() => {
        
      }); // needed to make sure changes are reflected in the UI
    });
  }

  ionViewWillLeave() {
    if(this.datareceivedsubscription){
      this.datareceivedsubscription.unsubscribe();
      this.datareceivedsubscription = undefined;
    }
  }


  async readpinvalues(){
    let configuredPinsArray:GPIOPin[] = Array.from(this.gpio.getTempGPIOPins().values()).filter(pin => pin.getIsConfigured() == true)
    await this.ble.senddataunformatted(this.id, (<GPIOInterface><unknown>this.device).formatreadpinvalues(configuredPinsArray));
  }

  async readpinvalue(){
    await this.ble.senddataunformatted(this.id, (<GPIOInterface><unknown>this.device).formatreadpinvalues([this.gpio.getTempGPIOPins().get(+this.selectedpin)]));
  }

  async writeallpinconfig(){
    await this.ble.senddataunformatted(this.id, (<GPIOInterface><unknown>this.device).formatwritepinvalues(Array.from(this.gpio.getTempGPIOPins().values())));
  }

  async writepinconfig(){
    await this.ble.senddataunformatted(this.id, (<GPIOInterface><unknown>this.device).formatwritepinvalues([this.gpio.getTempGPIOPins().get(+this.selectedpin)]));
  }

  pinchanged(pinid:number){
  }

  backclicked(){
    return this.modalCtrl.dismiss('confirm');
  }

  pwmRatioformatter(value: number) {
    return `${value}%`;
  }

  pwmRatioChanged(event){
    this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinValue().setUint8(0,(event.detail.value * 254/100));
  }


  outputToggleChanged(event){
    this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinValue().setUint8(0,(<Boolean>event.detail.checked) ? 1 : 0);
  }

  canReadPin():Boolean{
    return this.gpio.getTempGPIOPins().get(+this.selectedpin).getIsConfigured();
  }

  canWritePin():Boolean{
    return (this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinType() == GPIOPinType.Output || this.gpio.getTempGPIOPins().get(+this.selectedpin).getPinType() == GPIOPinType.PWM);
  }

}
