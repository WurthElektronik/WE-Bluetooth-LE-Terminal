import { Component, NgZone, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonInput, IonSelect, ModalController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { BleService } from '../../services/ble.service';
import { LogMessageType } from 'src/app/Logger/LogMessageType';
import { SelectEncodingComponent } from 'src/app/Components/select-encoding/select-encoding.component';
import { EncodingType } from 'src/app/Encoders/EncodingType';
import { AsciiToBuffer, CheckAscii, BufferToAscii, InputFilterAscii } from 'src/app/Encoders/ASCII';
import { CheckHex, HexToBuffer, BufferToHex, InputFilterHex } from 'src/app/Encoders/HEX';
import { environment } from '../../../environments/environment';
import { testdevice } from 'src/app/TestDevice/TestBLEDevice';
import { ConfigGpioComponent } from 'src/app/Components/config-gpio/config-gpio.component';
import { ConnectionPriority } from '@capacitor-community/bluetooth-le';
import { RwGpioComponent } from 'src/app/Components/rw-gpio/rw-gpio.component';

@Component({
  selector: 'app-terminal',
  templateUrl: 'TerminalTab.html',
  styleUrls: ['TerminalTab.scss']
})
export class TerminalTab {
  id:string = null;
  private disconnectsubscription: Subscription;
  private msgloggedsubscription: Subscription;
  @ViewChild('terminalpopover') terminalpopover;
  public terminalpopoveropen:Boolean = false;
  public msgfilterskeys = Object.keys(LogMessageType).map(key => LogMessageType[key]).filter(value => typeof value === 'string') as string[];
  public msgfilters = LogMessageType;
  public selectedfilters:string[] = ['Info','Data','GPIO'];
  public selectedfiltersenum:LogMessageType[] = [];
  @ViewChild('devicepopover') devicepopover;
  @ViewChild('requestconnectionpopover') requestconnectionpopover;
  public devicepopoveropen:Boolean = false;
  public connectionprioritypopoveropen:Boolean = false;
  @ViewChild('ioncontent') content: IonContent;
  public payload:string = undefined;
  public selectedencoding:string = EncodingType[EncodingType.ASCII];
  public sendtoall:Boolean = false;
  @ViewChild('filterselect') filterselect: IonSelect;
  @ViewChild('payloadinput') payloadinput: IonInput;

  BufferToHex = BufferToHex;
  BufferToAscii = BufferToAscii;
  ConnectionPriority = ConnectionPriority;
  LogMessageType = LogMessageType;

  constructor(private route: ActivatedRoute,public platform: Platform, private router: Router,public ble:BleService,private ngZone: NgZone,private modalCtrl: ModalController,private toastController: ToastController,private translateService: TranslateService) {}

  async ngOnInit() {
    this.platform.keyboardDidShow.subscribe(ev => {
      setTimeout(() => {
        this.content.scrollToBottom(0);
      },20);
    });
    this.platform.keyboardDidHide.subscribe(ev => {
      setTimeout(() => {
        this.content.scrollToBottom(0);
      },20);
    });
    this.translateService.onLangChange.subscribe(() => {
      let filterkeys:string[] = [];
      for(let filter of this.selectedfilters){
        filterkeys.push("TerminalTab.filters." + filter);
      }
      this.translateService.get(filterkeys).subscribe(async (res) => {
        if(this.filterselect != undefined){
          this.filterselect.selectedText = "";
          for (let item in res) {
            this.filterselect.selectedText += `${res[item]}, `;
          }
          this.filterselect.selectedText = this.filterselect.selectedText.slice(0, -2);
        }
      });
    });
    this.route.queryParamMap
    .subscribe(async (params) => {
      let deviceid = params.get("deviceid");
      if(deviceid != undefined && this.ble.connectedDevices.has(deviceid)){
        this.id = deviceid;
        if(this.msgloggedsubscription){
          this.msgloggedsubscription.unsubscribe();
        }
        this.msgloggedsubscription = this.ble.connectedDevices.get(this.id).getLoggerDataLoggedSubject().subscribe(async () => {
          this.ngZone.run(() => {}); // needed to make sure changes are reflected in the UI
          setTimeout(() => {
            this.content.scrollToBottom(0);
          },20);
        });
        setTimeout(() => {
          this.content.scrollToBottom(0);
        },20);
      }
    });
  }

  ionViewWillEnter(){

    this.disconnectsubscription = this.ble.onDeviceDisconnected.subscribe(async (disconnecteddeviceid:string) => {
      if(this.ble.connectedDevices.size == 0){
        this.selectedfilters = ['Info','Data','GPIO'];
        this.selectedfiltersenum = [];
        this.router.navigate(
          ['/tabs/scan']
        );
      }else{
        let sorteddeviceidsarray = Array.from(new Map([...this.ble.connectedDevices.entries()].sort((a, b) => a[0].localeCompare(b[0]))).keys());
        let nextdeviceid = sorteddeviceidsarray.findIndex(e=> e.localeCompare(disconnecteddeviceid) > 0);
        if(nextdeviceid == -1){
          this.router.navigate([], {
            queryParams: {
              'deviceid': sorteddeviceidsarray[sorteddeviceidsarray.length - 1],
            },
            queryParamsHandling: 'merge'
          })
        }else{
          this.router.navigate([], {
            queryParams: {
              'deviceid': sorteddeviceidsarray[nextdeviceid],
            },
            queryParamsHandling: 'merge'
          })
        }
      }
    });
  }

  ionViewWillLeave() {

    if(this.msgloggedsubscription){
      this.msgloggedsubscription.unsubscribe();
      this.msgloggedsubscription = undefined;
    }

    this.disconnectsubscription.unsubscribe();
    this.disconnectsubscription = undefined;
  }

  async disconnectclick(){
    if(!environment.production && this.id == testdevice.deviceId){
      this.ble.connectedDevices.delete(this.id);
      this.ble.onDeviceDisconnected.next(this.id);
    }else{
      await this.ble.disconnect(this.id);
    }
  }

  segmentClicked(deviceid:string){
    this.router.navigate([], {
      queryParams: {
        'deviceid': deviceid,
      },
      queryParamsHandling: 'merge'
    })
  }

  terminalpopoverclick(e: Event){
    this.terminalpopover.event = e;
    this.terminalpopoveropen = true;
  }

  devicepopoverclick(e: Event){
    this.devicepopover.event = e;
    this.requestconnectionpopover.event = e;
    this.devicepopoveropen = true;
  }

  connectionprioritypopoverclick(){
    this.connectionprioritypopoveropen = true;
  }

  updatepayload(event){
    this.payload = event.detail.value;
  }

  async sendclick(){

    this.payloadinput.setFocus();

    try{
      if(this.payload && this.payload.length != 0){

        var datatosend:DataView;

        switch(EncodingType[this.selectedencoding]){
          default:
          case EncodingType.ASCII:
            if(!CheckAscii(this.payload)){
              throw new Error("ParserMessages.ASCIIError");
            }
            datatosend = new DataView(AsciiToBuffer(this.payload));
            break;
          case EncodingType.HEX:
            if(!CheckHex(this.payload)){
              throw new Error("ParserMessages.HEXError");
            }
            datatosend = new DataView(HexToBuffer(this.payload.replace(/ /g,'')));
            break;
        }

        this.payload = '';

        if(this.sendtoall){
          await this.ble.senddata(undefined, datatosend);
        }else{
          await this.ble.senddata(this.id, datatosend);
        }

        setTimeout(() => {
          this.content.scrollToBottom(0);
        },20);

      }
    }catch(error){
      this.translateService.get(error.message).subscribe(async (res: string) => {
        const errortoast = await this.toastController.create({
          message: res,
          duration: 500,
          position: 'bottom',
          cssClass: 'toastwidth'
        });
        errortoast.present();
      });
    }
  }

  async filterTypeChanged(event){
    let selectedfiltersstrings:string[] = event.detail.value;

    this.filterselect.selectedText = undefined;

    this.selectedfiltersenum = [];

    for(let filter of selectedfiltersstrings){
      switch(filter){
        case 'Info':{
          this.selectedfiltersenum.push(LogMessageType.Info);
          break;
        }
        case 'Data':{
          this.selectedfiltersenum.push(LogMessageType.DataSent,LogMessageType.DataReceived);
          break;
        }
        case 'GPIO':{
          this.selectedfiltersenum.push(LogMessageType.GPIO);
          break;
        }
      }
    }

    setTimeout(() => {
      this.content.scrollToBottom(0);
    },20); 
  }

  onPayloadInput(event){
    let value:string = event.detail.value;
    var filteredValue:string = value;
    switch(EncodingType[this.selectedencoding]){
      default:
      case EncodingType.ASCII:
        filteredValue = InputFilterAscii(value);
        break;
      case EncodingType.HEX:
        filteredValue = InputFilterHex(value);
        break;
    }
    this.payloadinput.value = filteredValue;
  }

  getmsgclass(msg):string  {
    switch(msg.getType()){
      case LogMessageType.Info:
        return 'infomsg';
      case LogMessageType.DataSent:
        return 'datasentmsg';
      case LogMessageType.DataReceived:
        return 'datareceivedmsg';
      case LogMessageType.GPIO:
        return 'gpiomsg';
      default:
        return '';
    }
  }

  async selectencodingclicked(){
      const modal = await this.modalCtrl.create({
        component: SelectEncodingComponent,
        componentProps: {
          selectedencoding: this.selectedencoding
        }
      });
      modal.cssClass = 'auto-height';
      modal.animated = false;
      modal.present();
  
      const { data, role } = await modal.onWillDismiss();

      if (role === 'confirm') {
        this.payload = undefined;
        this.selectedencoding = EncodingType[data];
      }
    }

    async configgpioclicked(){
      const modal = await this.modalCtrl.create({
        component: ConfigGpioComponent,
        componentProps: {
          id: this.id
        }
      });
      modal.cssClass = 'auto-height';
      modal.animated = false;
      modal.backdropDismiss = false;
      modal.present();
      
      await modal.onWillDismiss();
    }

    async rwgpioclicked(){
      const modal = await this.modalCtrl.create({
        component: RwGpioComponent,
        componentProps: {
          id: this.id
        }
      });
      modal.cssClass = 'auto-height';
      modal.animated = false;
      modal.backdropDismiss = false;
      modal.present();
      
      await modal.onWillDismiss();
    }

    async readrssi(){
      await this.ble.readrssi(this.id);
    }

    async readmtu(){
      await this.ble.readmtu(this.id);
    }

    async requestconnectionpriority(priority:string){
      await this.ble.requestpriority(this.id, ConnectionPriority[priority]);
    }
}
