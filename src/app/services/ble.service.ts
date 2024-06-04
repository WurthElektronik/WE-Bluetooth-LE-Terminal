import { Injectable, NgZone } from '@angular/core';
import { BleClient, BleDevice, ConnectionPriority, ScanResult } from '@capacitor-community/bluetooth-le';
import { Subject } from 'rxjs';
import { GeneralBLEModule } from '../BLEModules/GeneralBLEModule';
import { BLEModuleType } from '../BLEModules/BLEModuleType';
import { ProteusIII } from '../BLEModules/Proteus/ProteusIII';
import { BufferToHex } from '../Encoders/HEX';
import { ProteusI } from '../BLEModules/Proteus/ProteusI';
import { ProteusII } from '../BLEModules/Proteus/ProteusII';
import { Proteuse } from '../BLEModules/Proteus/Proteuse';
import { SetebosI } from '../BLEModules/Proteus/SetebosI';
import { StephanoI } from '../BLEModules/Stephano/StephanoI';
import { ScanFilter } from '../Filters/ScanFilter';
import { FilterType } from '../Filters/FilterType';
import { ServiceUUIDFilter } from '../Filters/ServiceUUIDFilter';
import { NameFilter } from '../Filters/NameFilter';

export const PROTEUS_BLE_SERVICE:string = "6e400001-c352-11e5-953d-0002a5d5c51b";
export const PROTEUS_BLE_RX_CHARACTERISTIC:string = "6e400002-c352-11e5-953d-0002a5d5c51b";
export const PROTEUS_BLE_TX_CHARACTERISTIC:string = "6e400003-c352-11e5-953d-0002a5d5c51b";
export const BLE_NOTIFICATION_DESCRIPTOR:string = "00002902-0000-1000-8000-00805f9b34fb";

@Injectable({
  providedIn: 'root'
})

export class BleService {

  connectedDevices:Map<string, GeneralBLEModule> = new Map<string, GeneralBLEModule>();
  
  public onDeviceDisconnected: Subject<any> = new Subject<any>();

  constructor() {
  }

  async initializeble(){
      await BleClient.initialize({ androidNeverForLocation: true });
  }

  async bluetoothenabled(){
    return BleClient.isEnabled();
  }

  async locationenabled(){
    return BleClient.isLocationEnabled();
  }

  async registerbluetoothstate(callback: (value: boolean) => void){
    await BleClient.startEnabledNotifications(callback);
  }

  async startscan(filters:Map<FilterType,ScanFilter>, callback: (scanresult: ScanResult) => void){
    try {
      let serviceUUIDFilter:ServiceUUIDFilter = filters.get(FilterType.ServiceUUID) as ServiceUUIDFilter;
      let nameFilter:NameFilter = filters.get(FilterType.Name) as NameFilter;
      await BleClient.requestLEScan(
      {
        services: serviceUUIDFilter ? [serviceUUIDFilter.getServiceUUID()] : undefined,
        optionalServices: [PROTEUS_BLE_SERVICE],
        namePrefix: nameFilter ? nameFilter.getName() : undefined
      },
      (result) => {
        callback(result);
      });
    } catch (error) {
    }
  }

  async requestdevice(filters:Map<FilterType,ScanFilter>, callback: (paireddevice: BleDevice) => void){
    try {
      let serviceUUIDFilter:ServiceUUIDFilter = filters.get(FilterType.ServiceUUID) as ServiceUUIDFilter;
      let nameFilter:NameFilter = filters.get(FilterType.Name) as NameFilter;
      let device = await BleClient.requestDevice({
        services: serviceUUIDFilter ? [serviceUUIDFilter.getServiceUUID()] : undefined,
        optionalServices: [PROTEUS_BLE_SERVICE],
        namePrefix: nameFilter ? nameFilter.getName() : undefined
      });
      callback(device);
    } catch (error) {
      callback(undefined);
    }
  }

  async stopscan(){
    try {
      await BleClient.stopLEScan();
    } catch (error) {
    }
  }

  async connect(device:BleDevice, moduletype: BLEModuleType){
    await BleClient.disconnect(device.deviceId);

    var module:GeneralBLEModule = undefined;
    switch(moduletype){
      case BLEModuleType.ProteusI:
        module = new ProteusI(device);
        break;
      case BLEModuleType.ProteusII:
        module = new ProteusII(device);
        break;
      case BLEModuleType.ProteusIII:
        module = new ProteusIII(device);
        break;
      case BLEModuleType.Proteuse:
        module = new Proteuse(device);
        break;
      case BLEModuleType.SetebosI:
        module = new SetebosI(device);
        break;
      case BLEModuleType.StephanoI:
        module = new StephanoI(device);
        break;
      default:
        return;
    }

    await BleClient.connect(device.deviceId,(deviceid) => {
      this.connectedDevices.delete(deviceid);
      this.onDeviceDisconnected.next(deviceid);
    });

    module.logInfo("LogMessages.DeviceConnected");
    while(!this.connectedDevices.has(device.deviceId)){
      await BleClient.getServices(device.deviceId).then(async (services) => {
        if(services.length != 0){
          let proteus_service = services.find(x => x.uuid === PROTEUS_BLE_SERVICE);
          if(proteus_service == undefined){
            await BleClient.disconnect(device.deviceId);
            return;
          }
          
          let proteus_characteristics_rx = proteus_service.characteristics.find(x => x.uuid === PROTEUS_BLE_RX_CHARACTERISTIC);
          let proteus_characteristics_tx = proteus_service.characteristics.find(x => x.uuid === PROTEUS_BLE_TX_CHARACTERISTIC);

          if(
            ((proteus_characteristics_rx == undefined) || (proteus_characteristics_rx.properties.writeWithoutResponse == false)) ||
            ((proteus_characteristics_tx == undefined) || (proteus_characteristics_tx.properties.notify == false))
            )
          {
            await BleClient.disconnect(device.deviceId);
            return;
          }

          module.logInfo("LogMessages.ServicesDiscovered");
          this.connectedDevices.set(device.deviceId,module);
        }
      });
    }

    await BleClient.startNotifications(
      device.deviceId,
      PROTEUS_BLE_SERVICE,
      PROTEUS_BLE_TX_CHARACTERISTIC,
      (value) => {
        this.connectedDevices.get(device.deviceId).handlerx(value);
      }
    );
    let descriptorvalue = await BleClient.readDescriptor(device.deviceId,PROTEUS_BLE_SERVICE,PROTEUS_BLE_TX_CHARACTERISTIC,BLE_NOTIFICATION_DESCRIPTOR);
    if(descriptorvalue.getUint16(0, true) == 0x1){
      this.connectedDevices.get(device.deviceId).logInfo("LogMessages.NotificationsDescriptorWritten",{'descriptorvalue': BufferToHex(descriptorvalue.buffer), 'descriptor': BLE_NOTIFICATION_DESCRIPTOR, 'characteristic': PROTEUS_BLE_TX_CHARACTERISTIC});
      this.connectedDevices.get(device.deviceId).logInfo("LogMessages.NotificationsEnabled");
    }
    await this.connectedDevices.get(device.deviceId).initializeModule();

  }

  async disconnect(deviceid:string){
    await BleClient.stopNotifications(deviceid,PROTEUS_BLE_SERVICE,PROTEUS_BLE_TX_CHARACTERISTIC);
    this.connectedDevices.get(deviceid).logInfo("LogMessages.NotificationsDisabled");
    await BleClient.disconnect(deviceid);
  }

  async senddata(deviceId:string, data:DataView, sendCount:number, sendDelay:number){
    if(deviceId == undefined){
      this.connectedDevices.forEach(async (module, deviceid) => {
        try {
          module.setSending(true);
          for (let i = 0; i < sendCount; i++) {
            let dataFormatted:DataView[] = await module.formatdatatx(data);
            for(let packet of dataFormatted){
              await BleClient.writeWithoutResponse(deviceid, PROTEUS_BLE_SERVICE, PROTEUS_BLE_RX_CHARACTERISTIC, packet);
            }
            if(i != (sendCount - 1)){
              await new Promise(f => setTimeout(f, sendDelay));
            }
          }
          module.setSending(false);
        } catch (error) {
          module.setSending(false);          
        }
      });
    }else{
      try {
        this.connectedDevices.get(deviceId).setSending(true);
        for (let i = 0; i < sendCount; i++) {
          let dataFormatted:DataView[] = await this.connectedDevices.get(deviceId).formatdatatx(data);
          for(let packet of dataFormatted){
            await BleClient.writeWithoutResponse(deviceId, PROTEUS_BLE_SERVICE, PROTEUS_BLE_RX_CHARACTERISTIC, packet);
          }
          if(i != (sendCount - 1)){
            await new Promise(f => setTimeout(f, sendDelay));
          }
        }
        this.connectedDevices.get(deviceId).setSending(false);
      } catch (error) {
        this.connectedDevices.get(deviceId).setSending(false);
      }
    }
  }

  async senddataunformatted(deviceId:string, data:DataView){
      await BleClient.writeWithoutResponse(deviceId, PROTEUS_BLE_SERVICE, PROTEUS_BLE_RX_CHARACTERISTIC, data);
  }

  async readrssi(deviceId:string){
      let rssi = await BleClient.readRssi(deviceId);
      this.connectedDevices.get(deviceId).logInfo(`RSSI : ${rssi} dBm`);
  }

  async readmtu(deviceId:string){
    let mtu = this.connectedDevices.get(deviceId).getMTUSize();
    this.connectedDevices.get(deviceId).logInfo(`MTU : ${mtu}`);
  }

  async requestpriority(deviceId:string, priority:ConnectionPriority){
    await BleClient.requestConnectionPriority(deviceId, priority);
    this.connectedDevices.get(deviceId).logInfo("LogMessages.RequestedConnectionPriority",{'priority': ConnectionPriority[priority]});
  }

}
