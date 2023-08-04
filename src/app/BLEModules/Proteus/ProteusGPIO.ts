import { BleClient, BleDevice } from "@capacitor-community/bluetooth-le";
import { GPIOPin } from "../GPIO/GPIOPin";
import { GeneralBLEGPIOModule } from "../GPIO/GeneralBLEGPIOModule";
import { GPIOPinType } from "../GPIO/GPIOPinType";
import { PROTEUS_BLE_RX_CHARACTERISTIC, PROTEUS_BLE_SERVICE } from "src/app/services/ble.service";
import { ProteusHeader } from "./ProteusHeader";
import { ProteusGPIOCommand } from "./ProteusGPIOCommand";

export abstract class ProteusGPIO extends GeneralBLEGPIOModule{

    constructor(bledevice:BleDevice){
        super(bledevice);
    }

    async initializeModule() {
        await BleClient.write(this.deviceId, PROTEUS_BLE_SERVICE, PROTEUS_BLE_RX_CHARACTERISTIC, this.formatreadpinconfiguration());
    }

    handlerx(data: DataView): void {
        switch(data.getUint8(0)){
            case ProteusHeader.RF_HEADER_TYPE_DATA:
                this.logDataReceived("LogMessages.DataReceived",undefined,data.buffer.slice(1));
                this.onDataReceived.next(undefined);
                break;
            case ProteusHeader.RF_HEADER_TYPE_CMD:
                switch(data.getUint8(1)){
                    case ProteusGPIOCommand.CMD_GPIO_REMOTE_READCONFIG_CNF:{
                        this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_REMOTE_READCONFIG_CNF],undefined,data.buffer);
                        var blockIdx = 2;
                        while(blockIdx < data.buffer.byteLength){
                            let blockSize = data.getUint8(blockIdx);
                            let gpioid = data.getUint8(blockIdx + 1);
                            let gpiotype = data.getUint8(blockIdx + 2);
                            let gpiopin = this.gpioPins.get(gpioid);
                            if(blockSize > 2){
                                gpiopin.setPinType(gpiotype);
                                let pinValue = new DataView(data.buffer.slice(blockIdx+3,blockIdx+3 + blockSize - 2));
                                switch(pinValue.byteLength){
                                    default:
                                    case 0x1:
                                        gpiopin.getPinConfigValue().setUint32(0,pinValue.getUint8(0),true);
                                        break;
                                    case 0x3:
                                        gpiopin.getPinConfigValue().setUint32(0,pinValue.getUint16(0) + (pinValue.getUint8(2) << 16),true);
                                        break;
                                }
                            }else{
                                gpiopin.setPinType(GPIOPinType.NoConfiguration);
                            }
                            blockIdx += blockSize + 1;
                        }
                        this.resetTempGPIOPins(Array.from(this.tempgpioPins.values()));
                        break;
                    }
                    case ProteusGPIOCommand.CMD_GPIO_REMOTE_WRITECONFIG_CNF:{
                        this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_REMOTE_WRITECONFIG_CNF],undefined,data.buffer);
                        var blockIdx = 2;
                        let changedpins:GPIOPin[] = [];
                        while(blockIdx < data.buffer.byteLength){
                            let blockSize = data.getUint8(blockIdx);
                            let gpioid = data.getUint8(blockIdx + 1);
                            let gpiostatus = data.getUint8(blockIdx + 2);
                            switch(gpiostatus){
                                case 0x0:
                                    this.gpioPins.set(gpioid,GPIOPin.copy(this.tempgpioPins.get(gpioid)));
                                    changedpins.push(this.tempgpioPins.get(gpioid));
                                    break;
                                case 0x1:
                                    break;
                                case 0xFF:
                                    break;
                            }
                            blockIdx += blockSize + 1;
                        }
                        this.resetTempGPIOPins(changedpins);
                        break;
                    }
                    case ProteusGPIOCommand.CMD_GPIO_REMOTE_READ_CNF:
                    case ProteusGPIOCommand.CMD_GPIO_LOCAL_WRITE_IND:{
                        switch(data.getUint8(1)){
                            case ProteusGPIOCommand.CMD_GPIO_REMOTE_READ_CNF:{
                                this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_REMOTE_READ_CNF],undefined,data.buffer);
                                break;
                            }
                            case ProteusGPIOCommand.CMD_GPIO_LOCAL_WRITE_IND:{
                                this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_LOCAL_WRITE_IND],undefined,data.buffer);
                                break;
                            }
                            default:
                                break;
                        }
                        var blockIdx = 2;
                        let readpins:GPIOPin[] = [];
                        while(blockIdx < data.buffer.byteLength){
                            let blockSize = data.getUint8(blockIdx);
                            let gpioid = data.getUint8(blockIdx + 1);
                            let gpiopin = this.gpioPins.get(gpioid);
                            let pinValue = data.getUint8(blockIdx + 2);
                            switch(gpiopin.getPinType()){
                                case GPIOPinType.Input:
                                case GPIOPinType.Output:
                                    switch(pinValue){
                                        case 0x0:
                                        case 0x1:
                                            gpiopin.getPinValue().setUint8(0,pinValue);
                                            readpins.push(this.tempgpioPins.get(gpioid));
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case GPIOPinType.PWM:
                                    switch(pinValue){
                                        case 0xFF:
                                            break;
                                        default:
                                            gpiopin.getPinValue().setUint8(0,pinValue);
                                            readpins.push(this.tempgpioPins.get(gpioid));
                                            break;
                                    }
                                    break;
                                default:
                                    break;
                            }
                            blockIdx += blockSize + 1;
                        }
                        this.resetTempGPIOPins(readpins);
                        break;
                    }
                    case ProteusGPIOCommand.CMD_GPIO_REMOTE_WRITE_CNF:{
                        this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_REMOTE_WRITE_CNF],undefined,data.buffer);
                        var blockIdx = 2;
                        let changedpins:GPIOPin[] = [];
                        while(blockIdx < data.buffer.byteLength){
                            let blockSize = data.getUint8(blockIdx);
                            let gpioid = data.getUint8(blockIdx + 1);
                            let gpiostatus = data.getUint8(blockIdx + 2);
                            switch(gpiostatus){
                                case 0x0:
                                    this.gpioPins.set(gpioid,GPIOPin.copy(this.tempgpioPins.get(gpioid)));
                                    changedpins.push(this.tempgpioPins.get(gpioid));
                                    break;
                                case 0x1:
                                    break;
                            }
                            blockIdx += blockSize + 1;
                        }
                        this.resetTempGPIOPins(changedpins);
                        break;
                    }
                    default:
                        break;
                }
                this.onDataReceived.next(undefined);
                break;
            default:
                break;
        }
    }

    async formatdatatx(data: DataView): Promise<DataView[]>{
        let dataheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_DATA]);
        let datapayload = new Uint8Array(data.buffer);
        let fulldata = new Uint8Array(dataheader.length + datapayload.length);
        fulldata.set(dataheader);
        fulldata.set(datapayload, dataheader.length);
        this.logDataSent("LogMessages.DataSent",undefined,fulldata.buffer.slice(1));
        return [new DataView(fulldata.buffer)];
    }

    formatreadpinconfiguration():DataView{
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusGPIOCommand.CMD_GPIO_REMOTE_READCONFIG_REQ]);
        let fulldata = new Uint8Array(cmdheader.length + cmd.length);
        fulldata.set(cmdheader);
        fulldata.set(cmd, cmdheader.length);
        this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_REMOTE_READCONFIG_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    };

    formatwritepinconfiguration(pins: GPIOPin[]):DataView{
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusGPIOCommand.CMD_GPIO_REMOTE_WRITECONFIG_REQ]);
        var data:number[] = [];
        for(let pin of pins){
            switch(pin.getPinType()){
                case GPIOPinType.NoConfiguration:
                    data = data.concat([0x03,pin.getPinID(),GPIOPinType.NoConfiguration,0x0]);
                    break;
                case GPIOPinType.Input:
                    data = data.concat([0x03,pin.getPinID(),GPIOPinType.Input,pin.getPinConfigValue().getUint8(0)]);
                    break;
                case GPIOPinType.Output:
                    data = data.concat([0x03,pin.getPinID(),GPIOPinType.Output,pin.getPinConfigValue().getUint8(0)]);
                    break;
                case GPIOPinType.PWM:
                    data = data.concat([0x05,pin.getPinID(),GPIOPinType.PWM,pin.getPinConfigValue().getUint8(1),pin.getPinConfigValue().getUint8(0),pin.getPinConfigValue().getUint8(2)]);
                    break;
            }
        }
        let datauint8 = Uint8Array.from(data);
        let fulldata = new Uint8Array(cmdheader.length + cmd.length + datauint8.length);
        fulldata.set(cmdheader);
        fulldata.set(cmd, cmdheader.length);
        fulldata.set(datauint8, cmdheader.length + cmd.length);
        this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_REMOTE_WRITECONFIG_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    };

    formatreadpinvalues(pins: GPIOPin[]):DataView{
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusGPIOCommand.CMD_GPIO_REMOTE_READ_REQ]);
        let data:number[] = [];
        data.push(pins.length);
        for(let pin of pins){
            data.push(pin.getPinID());
        }
        let datauint8 = Uint8Array.from(data);
        let fulldata = new Uint8Array(cmdheader.length + cmd.length + datauint8.length);
        fulldata.set(cmdheader);
        fulldata.set(cmd, cmdheader.length);
        fulldata.set(datauint8, cmdheader.length + cmd.length);
        this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_REMOTE_READ_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    };

    formatwritepinvalues(pins: GPIOPin[]):DataView{
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusGPIOCommand.CMD_GPIO_REMOTE_WRITE_REQ]);
        let data:number[] = [];
        for(let pin of pins){
            data = data.concat([0x02,pin.getPinID(),pin.getPinValue().getUint8(0)]);
        }
        let datauint8 = Uint8Array.from(data);
        let fulldata = new Uint8Array(cmdheader.length + cmd.length + datauint8.length);
        fulldata.set(cmdheader);
        fulldata.set(cmd, cmdheader.length);
        fulldata.set(datauint8, cmdheader.length + cmd.length);
        this.logGPIO(ProteusGPIOCommand[ProteusGPIOCommand.CMD_GPIO_REMOTE_WRITE_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    };

}