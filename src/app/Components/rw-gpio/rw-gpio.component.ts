import { Component, NgZone, OnInit,ViewChild,ElementRef } from '@angular/core';
import { IonInput, IonSelect, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GPIOInputPinType } from 'src/app/BLEModules/GPIO/GPIOInputPinType';
import { GPIOOutputPinType } from 'src/app/BLEModules/GPIO/GPIOOutputPinType';
import { GPIOPin } from 'src/app/BLEModules/GPIO/GPIOPin';
import { GPIOPinType } from 'src/app/BLEModules/GPIO/GPIOPinType';
import { GeneralBLEGPIOModule } from 'src/app/BLEModules/GPIO/GeneralBLEGPIOModule';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-rw-gpio',
  templateUrl: './rw-gpio.component.html',
  styleUrls: ['./rw-gpio.component.scss'],
})
export class RwGpioComponent implements OnInit {
  public id:string;
  public device:GeneralBLEGPIOModule;
  public selectedpin:string;
  public pinTypes = GPIOPinType;
  public inputPinTypes = GPIOInputPinType;
  public outputPinTypes = GPIOOutputPinType;
  private datareceivedsubscription: Subscription;
  public pwmratioValue:number;
  public isPinConfigured:Boolean = false;

  constructor(public ble:BleService,private modalCtrl: ModalController,private ngZone: NgZone) { }

  ngOnInit() {
    this.device = <GeneralBLEGPIOModule>this.ble.connectedDevices.get(this.id);
    this.selectedpin = String(this.device.getGPIOPins().keys().next().value);
    this.device.resetTempGPIOPins(Array.from(this.device.getTempGPIOPins().values()));
    this.isPinConfigured = Array.from(this.device.getTempGPIOPins().values()).filter(pin => pin.getIsConfigured() == true).length != 0;
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
    let configuredPinsArray:GPIOPin[] = Array.from(this.device.getTempGPIOPins().values()).filter(pin => pin.getIsConfigured() == true)
    await this.ble.senddataunformatted(this.id, this.device.formatreadpinvalues(configuredPinsArray));
  }

  async readpinvalue(){
    await this.ble.senddataunformatted(this.id, this.device.formatreadpinvalues([this.device.getTempGPIOPins().get(+this.selectedpin)]));
  }

  async writeallpinconfig(){
    await this.ble.senddataunformatted(this.id, this.device.formatwritepinvalues(Array.from(this.device.getTempGPIOPins().values())));
  }

  async writepinconfig(){
    await this.ble.senddataunformatted(this.id, this.device.formatwritepinvalues([this.device.getTempGPIOPins().get(+this.selectedpin)]));
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
    this.device.getTempGPIOPins().get(+this.selectedpin).getPinValue().setUint8(0,(event.detail.value * 254/100));
  }


  outputToggleChanged(event){
    this.device.getTempGPIOPins().get(+this.selectedpin).getPinValue().setUint8(0,(<Boolean>event.detail.checked) ? 1 : 0);
  }

  canReadPin():Boolean{
    return this.device.getTempGPIOPins().get(+this.selectedpin).getIsConfigured();
  }

  canWritePin():Boolean{
    return (this.device.getTempGPIOPins().get(+this.selectedpin).getPinType() == GPIOPinType.Output || this.device.getTempGPIOPins().get(+this.selectedpin).getPinType() == GPIOPinType.PWM);
  }

}
