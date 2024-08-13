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
  public selectedfilters:string[] = ['Info','Data','RemoteCommand'];
  public selectedfiltersenum:LogMessageType[] = [];
  @ViewChild('devicepopover') devicepopover;
  @ViewChild('requestconnectionpopover') requestconnectionpopover;
  public devicepopoveropen:Boolean = false;
  public connectionprioritypopoveropen:Boolean = false;
  @ViewChild('ioncontent') content: IonContent;
  public payload:string = undefined;
  public selectedencoding:string = EncodingType[EncodingType.ASCII];
  public only_printable_ascii:boolean = false;
  public sendtoall:Boolean = false;
  public multiplepackets:Boolean = false;
  @ViewChild('filterselect') filterselect: IonSelect;
  @ViewChild('payloadinput') payloadinput: IonInput;
  @ViewChild('sendcountinput') sendcountinput: IonInput;
  @ViewChild('txintervalinput') txintervalinput: IonInput;

  public payloadCount:number = 0;
  public sendCount:number = 1;
  public txInterval:number = 1000;

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
        this.selectedfilters = ['Info','Data','RemoteCommand'];
        this.selectedfiltersenum = [];
        this.sendCount = 1;
        this.txInterval = 1000;
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
            if(!CheckAscii(this.payload, this.only_printable_ascii)){
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
        this.payloadinput.value = '';
        this.payloadCounter();
        
        try{
          await this.ble.senddata(
            this.sendtoall ? undefined : this.id,
            datatosend,
            this.multiplepackets ? this.sendCount : 1,
            this.multiplepackets ? this.txInterval : 0
          );
        }catch(error){
          console.log(error);
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
        case 'RemoteCommand':{
          this.selectedfiltersenum.push(LogMessageType.RemoteCommand);
          break;
        }
      }
    }

    setTimeout(() => {
      this.content.scrollToBottom(0);
    },20); 
  }

  onSendCountInput(event){
    let value:string = event.detail.value;
    let filteredValue:string = value.replace(/[^0-9]+/g, '');
    this.sendcountinput.value = filteredValue;
  }

  onSendCountChange(event){
    let value:number = +event.detail.value;
    this.sendcountinput.value = this.sendCount = (value <= 1) ? 1 : value;
  }

  onTXIntervalInput(event){
    let value:string = event.detail.value;
    let filteredValue:string = value.replace(/[^0-9]+/g, '');
    this.txintervalinput.value = filteredValue;
  }

  onTXIntervalChange(event){
    let value:number = +event.detail.value;
    this.txintervalinput.value = this.txInterval = (value <= 50) ? 50 : value;
  }

  onPayloadInput(event){
    let value:string = event.detail.value;
    var filteredValue:string = value;
    switch(EncodingType[this.selectedencoding]){
      default:
      case EncodingType.ASCII:
        filteredValue = InputFilterAscii(value, this.only_printable_ascii);
        break;
      case EncodingType.HEX:
        filteredValue = InputFilterHex(value);
        break;
    }
    this.payloadinput.value = filteredValue;
    this.payloadCounter();
  }

  payloadCounter() {
    switch(EncodingType[this.selectedencoding]){
      default:
      case EncodingType.ASCII:
        this.payloadCount = (this.payloadinput.value as string).length;
        break;
      case EncodingType.HEX:
        this.payloadCount = Math.floor((this.payloadinput.value as string).replace(/ /g,'').length / 2);
        break;
    }
  }

  getmsgclass(msg):string  {
    switch(msg.getType()){
      case LogMessageType.Info:
        return 'infomsg';
      case LogMessageType.DataSent:
        return 'datasentmsg';
      case LogMessageType.DataReceived:
        return 'datareceivedmsg';
      case LogMessageType.RemoteCommand:
        return 'remotecommandmsg';
      default:
        return '';
    }
  }

  async selectencodingclicked(){
      const modal = await this.modalCtrl.create({
        component: SelectEncodingComponent,
        componentProps: {
          selectedencoding: this.selectedencoding,
          only_printable_ascii: this.only_printable_ascii
        }
      });
      modal.cssClass = 'auto-height';
      modal.animated = false;
      modal.present();
  
      const { data, role } = await modal.onWillDismiss();

      if (role === 'confirm') {
        this.payload = undefined;
        this.selectedencoding = EncodingType[data['selectedencoding']];
        this.only_printable_ascii = data['only_printable_ascii'];
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
