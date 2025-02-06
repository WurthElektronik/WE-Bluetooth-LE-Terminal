import { Injectable, NgZone } from '@angular/core';
import { BleCharacteristic, BleClient, BleDevice, ConnectionPriority, ScanResult } from '@capacitor-community/bluetooth-le';
import { Subject } from 'rxjs';
import { GeneralBLEModule } from '../BLEModules/GeneralBLEModule';
import { BLEModuleType } from '../BLEModules/BLEModuleType';
import { ProteusIII } from '../BLEModules/Proteus/ProteusIII';
import { ProteusI } from '../BLEModules/Proteus/ProteusI';
import { ProteusII } from '../BLEModules/Proteus/ProteusII';
import { Proteuse } from '../BLEModules/Proteus/Proteuse';
import { SetebosI } from '../BLEModules/Proteus/SetebosI';
import { StephanoI } from '../BLEModules/Stephano/StephanoI';
import { ScanFilter } from '../Filters/ScanFilter';
import { FilterType } from '../Filters/FilterType';
import { ServiceUUIDFilter } from '../Filters/ServiceUUIDFilter';
import { NameFilter } from '../Filters/NameFilter';
import { HEX } from '../Encoders/HEX';
import { BLE_CCCD_UUID, CCCD_Value } from '../BLEProfiles/CCCD';
import { SkollI } from '../BLEModules/Skoll/SkollI';
import { BLEProfileType } from '../BLEProfiles/BLEProfileType';
import { WESPPProfile } from '../BLEProfiles/WESPPProfile';
import { CYSPPProfile } from '../BLEProfiles/CYSPPProfile';
import { DataMode } from '../BLEProfiles/DataMode';

@Injectable({
  providedIn: 'root'
})

export class BleService {

  connectedDevices:Map<string, GeneralBLEModule> = new Map<string, GeneralBLEModule>();
  
  public onDeviceDisconnected: Subject<any> = new Subject<any>();

  constructor() {
  }

  async startscan(filters:Map<FilterType,ScanFilter>, callback: (scanresult: ScanResult) => void){
    try {
      let serviceUUIDFilter:ServiceUUIDFilter = filters.get(FilterType.ServiceUUID) as ServiceUUIDFilter;
      let nameFilter:NameFilter = filters.get(FilterType.Name) as NameFilter;
      await BleClient.requestLEScan(
      {
        services: serviceUUIDFilter ? [serviceUUIDFilter.getServiceUUID()] : undefined,
        optionalServices: [WESPPProfile.getService().uuid, CYSPPProfile.getService().uuid],
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
        optionalServices: [WESPPProfile.getService().uuid, CYSPPProfile.getService().uuid],
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

  async connect(device:BleDevice, moduletype: BLEModuleType, dataMode: DataMode){
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
      case BLEModuleType.SkollI:
        module = new SkollI(device, dataMode);
        break;
      default:
        return;
    }

    await BleClient.connect(device.deviceId,(deviceid) => {
      this.connectedDevices.delete(deviceid);
      this.onDeviceDisconnected.next(deviceid);
    });

    module.logInfo("LogMessages.DeviceConnected");

    let bleProfile = module.getBLEProfile();

    while(!this.connectedDevices.has(device.deviceId)){
      await BleClient.getServices(device.deviceId).then(async (services) => {
        if(services.length != 0){
          let ble_device_service = services.find(x => x.uuid === bleProfile.getService().uuid);
          if(ble_device_service == undefined){
            await BleClient.disconnect(device.deviceId);
            return;
          }

          for (let characteristic of bleProfile.getService().characteristics) {
            let ble_profile_characteristic = ble_device_service.characteristics.find(x => x.uuid === characteristic.uuid);
            if(ble_profile_characteristic == undefined)
            {
              await BleClient.disconnect(device.deviceId);
              return;
            }
            
            for (let property of Object.keys(characteristic.properties)){
              if(characteristic.properties[property] != ble_profile_characteristic.properties[property])
              {
                await BleClient.disconnect(device.deviceId);
                return;
              }
            }

          }

          module.logInfo("LogMessages.ServicesDiscovered");
          this.connectedDevices.set(device.deviceId,module);
        }
      });
    }

    module.logInfo("LogMessages.ProfileUsed", {profile: BLEProfileType[bleProfile.getType()]});

    var txcharacteristic:BleCharacteristic;

    switch(module.getDataMode())
    {
      default:
      case DataMode.UnacknowledgedData:
        await bleProfile.startReceiveDataUnacknowledged(device.deviceId, (value)=> {
          this.connectedDevices.get(device.deviceId).handlerx(value);
        });
        txcharacteristic = bleProfile.getUnacknowledgedDataTXCharacteristic();
        break;
      case DataMode.AcknowledgedData:
        await bleProfile.startReceiveDataAcknowledged(device.deviceId, (value)=> {
          this.connectedDevices.get(device.deviceId).handlerx(value);
        });
        txcharacteristic = bleProfile.getAcknowledgedDataTXCharacteristic();
        break;
    }

    let descriptorvalue = await BleClient.readDescriptor(device.deviceId, bleProfile.getService().uuid, txcharacteristic.uuid, BLE_CCCD_UUID);
    this.connectedDevices.get(device.deviceId).logInfo("LogMessages.CCCDWritten",{'descriptorvalue': HEX.BufferToEncoding(descriptorvalue.buffer), 'descriptor': BLE_CCCD_UUID, 'characteristic': txcharacteristic.uuid});

    switch(descriptorvalue.getUint16(0, true))
    {
      default:
      case CCCD_Value.Notification:
      {
        this.connectedDevices.get(device.deviceId).logInfo("LogMessages.NotificationsEnabled");
        break;
      }
      case CCCD_Value.Indication:
      {
        this.connectedDevices.get(device.deviceId).logInfo("LogMessages.IndicationsEnabled");
        break;
      }
    }

    await this.connectedDevices.get(device.deviceId).initializeModule();

  }

  async disconnect(deviceid:string){
    let module = this.connectedDevices.get(deviceid);
    let bleProfile = module.getBLEProfile();
    var descriptorvalue:DataView;
    
    switch(module.getDataMode())
    {
      default:
      case DataMode.UnacknowledgedData:
        descriptorvalue = await BleClient.readDescriptor(deviceid, bleProfile.getService().uuid, bleProfile.getUnacknowledgedDataTXCharacteristic().uuid, BLE_CCCD_UUID);
        await bleProfile.stopReceiveDataUnacknowledged(deviceid);
        break;
      case DataMode.AcknowledgedData:
        descriptorvalue = await BleClient.readDescriptor(deviceid, bleProfile.getService().uuid, bleProfile.getAcknowledgedDataTXCharacteristic().uuid, BLE_CCCD_UUID);
        await bleProfile.stopReceiveDataAcknowledged(deviceid);
        break;
    }
    switch(descriptorvalue.getUint16(0, true))
    {
      default:
      case CCCD_Value.Notification:
      {
        this.connectedDevices.get(deviceid).logInfo("LogMessages.NotificationsDisabled");
        break;
      }
      case CCCD_Value.Indication:
      {
        this.connectedDevices.get(deviceid).logInfo("LogMessages.IndicationsDisabled");
        break;
      }
    }
    await BleClient.disconnect(deviceid);
  }

  async senddata(deviceId:string, data:DataView, sendCount:number, sendDelay:number){
    let deviceIDs:string[] = (deviceId == undefined) ? (Array.from(this.connectedDevices.keys())) : [deviceId];
    deviceIDs.forEach(async (deviceid) => {
      let module = this.connectedDevices.get(deviceid);
      try {
        module.setSending(true);
        let bleProfile = module.getBLEProfile();
        for (let i = 0; i < sendCount; i++) {
          let dataFormatted:DataView[] = await module.formatdatatx(data);
          for(let packet of dataFormatted){
            switch(module.getDataMode())
              {
                default:
                case DataMode.UnacknowledgedData:
                  await bleProfile.sendDataUnacknowledged(deviceid, packet);
                  break;
                case DataMode.AcknowledgedData:
                  await bleProfile.sendDataAcknowledged(deviceid, packet);
                  break;
              }
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
  }

  async senddataunformatted(deviceId:string, data:DataView){
    let module = this.connectedDevices.get(deviceId);
    let bleProfile = module.getBLEProfile();

    switch(module.getDataMode())
    {
      default:
      case DataMode.UnacknowledgedData:
        await bleProfile.sendDataUnacknowledged(deviceId, data);
        break;
      case DataMode.AcknowledgedData:
        await bleProfile.sendDataAcknowledged(deviceId, data);
        break;
    }
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
