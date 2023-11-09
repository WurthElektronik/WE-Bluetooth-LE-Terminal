import { BleClient, BleDevice } from "@capacitor-community/bluetooth-le";
import { GeneralBLEModule } from "../GeneralBLEModule";
import { ProteusHeader } from "./ProteusHeader";
import { GPIO } from "../GPIO/GPIO";
import { PROTEUS_BLE_RX_CHARACTERISTIC, PROTEUS_BLE_SERVICE } from "src/app/services/ble.service";
import { ProteusCommand } from "./ProteusCommand";
import { GPIOPin } from "../GPIO/GPIOPin";
import { GPIOPinType } from "../GPIO/GPIOPinType";
import { GPIOInterface } from "../GPIO/GPIOInterface";
import { ProteusHighThroughput } from "./ProteusHighThroughput";

export abstract class Proteus extends GeneralBLEModule implements GPIOInterface{

    protected proteusGPIO: GPIO = undefined;
    protected proteusHighThroughput: ProteusHighThroughput = undefined;

    protected readonly HIGHTHROUGHPUT_ENABLED:Boolean = false; //set this to true to enable autoamtic switching to highthroughput mode on modules that support it

    constructor(bledevice:BleDevice){
        super(bledevice);
    }

    handlerx(data: DataView): void {
        switch(data.getUint8(0)){
            case ProteusHeader.RF_HEADER_TYPE_DATA:
                this.logDataReceived("LogMessages.DataReceived",undefined,data.buffer.slice(1));
                break;
            case ProteusHeader.RF_HEADER_TYPE_CMD:
                switch(data.getUint8(1)){
                    case ProteusCommand.CMD_GETSTATE_CNF:{
                        if(!this.getMaxPayloadRequestSupport()){
                            return;
                        }
                        this.setMTUSize(data.getUint8(2) + 4);
                        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GETSTATE_CNF],undefined,data.buffer);
                        break;
                    }
                    case ProteusCommand.CMD_GPIO_REMOTE_READCONFIG_CNF:{
                        if(!this.getGPIOSupport()){
                            return;
                        }
                        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_REMOTE_READCONFIG_CNF],undefined,data.buffer);
                        var blockIdx = 2;
                        while(blockIdx < data.buffer.byteLength){
                            let blockSize = data.getUint8(blockIdx);
                            let gpioid = data.getUint8(blockIdx + 1);
                            let gpiotype = data.getUint8(blockIdx + 2);
                            let gpiopin = this.proteusGPIO.getGPIOPins().get(gpioid);
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
                        this.proteusGPIO.resetTempGPIOPins(Array.from(this.proteusGPIO.getTempGPIOPins().values()));
                        break;
                    }
                    case ProteusCommand.CMD_GPIO_REMOTE_WRITECONFIG_CNF:{
                        if(!this.getGPIOSupport()){
                            return;
                        }
                        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_REMOTE_WRITECONFIG_CNF],undefined,data.buffer);
                        var blockIdx = 2;
                        let changedpins:GPIOPin[] = [];
                        while(blockIdx < data.buffer.byteLength){
                            let blockSize = data.getUint8(blockIdx);
                            let gpioid = data.getUint8(blockIdx + 1);
                            let gpiostatus = data.getUint8(blockIdx + 2);
                            switch(gpiostatus){
                                case 0x0:
                                    this.proteusGPIO.getGPIOPins().set(gpioid,GPIOPin.copy(this.proteusGPIO.getTempGPIOPins().get(gpioid)));
                                    changedpins.push(this.proteusGPIO.getTempGPIOPins().get(gpioid));
                                    break;
                                case 0x1:
                                    break;
                                case 0xFF:
                                    break;
                            }
                            blockIdx += blockSize + 1;
                        }
                        this.proteusGPIO.resetTempGPIOPins(changedpins);
                        break;
                    }
                    case ProteusCommand.CMD_GPIO_REMOTE_READ_CNF:
                    case ProteusCommand.CMD_GPIO_LOCAL_WRITE_IND:{
                        if(!this.getGPIOSupport()){
                            return;
                        }
                        switch(data.getUint8(1)){
                            case ProteusCommand.CMD_GPIO_REMOTE_READ_CNF:{
                                this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_REMOTE_READ_CNF],undefined,data.buffer);
                                break;
                            }
                            case ProteusCommand.CMD_GPIO_LOCAL_WRITE_IND:{
                                this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_LOCAL_WRITE_IND],undefined,data.buffer);
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
                            let gpiopin = this.proteusGPIO.getGPIOPins().get(gpioid);
                            let pinValue = data.getUint8(blockIdx + 2);
                            switch(gpiopin.getPinType()){
                                case GPIOPinType.Input:
                                case GPIOPinType.Output:
                                    switch(pinValue){
                                        case 0x0:
                                        case 0x1:
                                            gpiopin.getPinValue().setUint8(0,pinValue);
                                            readpins.push(this.proteusGPIO.getTempGPIOPins().get(gpioid));
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
                                            readpins.push(this.proteusGPIO.getTempGPIOPins().get(gpioid));
                                            break;
                                    }
                                    break;
                                default:
                                    break;
                            }
                            blockIdx += blockSize + 1;
                        }
                        this.proteusGPIO.resetTempGPIOPins(readpins);
                        break;
                    }
                    case ProteusCommand.CMD_GPIO_REMOTE_WRITE_CNF:{
                        if(!this.getGPIOSupport()){
                            return;
                        }
                        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_REMOTE_WRITE_CNF],undefined,data.buffer);
                        var blockIdx = 2;
                        let changedpins:GPIOPin[] = [];
                        while(blockIdx < data.buffer.byteLength){
                            let blockSize = data.getUint8(blockIdx);
                            let gpioid = data.getUint8(blockIdx + 1);
                            let gpiostatus = data.getUint8(blockIdx + 2);
                            switch(gpiostatus){
                                case 0x0:
                                    this.proteusGPIO.getGPIOPins().set(gpioid,GPIOPin.copy(this.proteusGPIO.getTempGPIOPins().get(gpioid)));
                                    changedpins.push(this.proteusGPIO.getTempGPIOPins().get(gpioid));
                                    break;
                                case 0x1:
                                    break;
                            }
                            blockIdx += blockSize + 1;
                        }
                        this.proteusGPIO.resetTempGPIOPins(changedpins);
                        break;
                    }
                    default:
                        break;
                }
                break;
            case ProteusHeader.RF_HEADER_TYPE_FRAGDATA:
                if(!this.getHighThroughputModeSupport()){
                    return;
                }
                let fragmentNumber:number = (data.getUint8(2) & 0xF0)>>4;
                let fragmentsCount:number = data.getUint8(2) & 0x0F;

                if(fragmentNumber > fragmentsCount){
                    return;
                }else if(
                    (0 < fragmentNumber) &&
                    (fragmentNumber <= 4) &&
                    (0 < fragmentsCount) &&
                    (fragmentsCount <= 4)
                    )
                {
                    if(fragmentNumber == fragmentsCount){
                        var combinedData:number[] = [];
                        for (let i = 0; i < (fragmentsCount-1); i++) {
                            if ((fragmentsCount != (this.proteusHighThroughput.getFragmentsDataByIndex(i).getUint8(2) & 0x0F)) ||
                            (data.getUint8(1) != this.proteusHighThroughput.getFragmentsDataByIndex(i).getUint8(1))){
                                return;
                            }else{
                                combinedData = combinedData.concat(Array.from(new Uint8Array(this.proteusHighThroughput.getFragmentsDataByIndex(i).buffer.slice(3))))
                            }
                        }
                        combinedData = combinedData.concat(Array.from(new Uint8Array(data.buffer.slice(3))))
                        this.logDataReceived("LogMessages.DataReceivedHighThroughput",undefined,new Uint8Array(combinedData).buffer);
                    }else{
                        this.proteusHighThroughput.setFragmentsDataAtIndex(fragmentNumber-1, data);
                    }
                }
                break;
            default:
                break;
        }
        this.onDataReceived.next(undefined);
    }

    async formatdatatx(data: DataView): Promise<DataView[]>{
        var mtu = this.getMTUSize() || this.getDefaultMTUSize();
        mtu -= 3; //this -3 is for the Bluetooth Attribute Protocol
        if(data.byteLength <= (mtu - 1)){ // -1 is for the overhead of ProteusHeader.RF_HEADER_TYPE_DATA
            let dataheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_DATA]);
            let datapayload = new Uint8Array(data.buffer);
            let fulldata = new Uint8Array(dataheader.length + datapayload.length);
            fulldata.set(dataheader);
            fulldata.set(datapayload, dataheader.length);
            this.logDataSent("LogMessages.DataSent",undefined,fulldata.buffer.slice(1));
            return [new DataView(fulldata.buffer)];
        }else if (this.getHighThroughputModeSupport() && (data.byteLength <= ((mtu - 3) * 4))){ // -3 is for the overhead of ProteusHeader.RF_HEADER_TYPE_FRAGDATA
            let fragmentsTotalCount:number = Math.ceil(data.byteLength / (mtu - 3));
            var remainingTotalLength:number = data.byteLength;
            var fragmentsCount:number = 1;
            let sequenceNumber:number = Math.floor(Math.random() * (0xFF + 1)) & 0xFF;
            let packets:DataView[] = [];
            while(remainingTotalLength > 0){
                var fragmentLength:number = 0;
                if(remainingTotalLength >= (mtu - 3)){
                    fragmentLength = mtu - 3;
                }else{
                    fragmentLength = remainingTotalLength;
                }
                let fragmentArray = new Uint8Array(fragmentLength + 3);
                fragmentArray.set([ProteusHeader.RF_HEADER_TYPE_FRAGDATA,sequenceNumber, (fragmentsTotalCount & 0x0F) | ((fragmentsCount<<4) & 0xF0)],0);
                let startBytePayload:number = (fragmentsCount - 1) * (mtu - 3);
                fragmentArray.set(Array.from(new Uint8Array(data.buffer.slice(startBytePayload, startBytePayload + fragmentLength))),3);
                packets.push(new DataView(fragmentArray.buffer))
                remainingTotalLength -= fragmentLength;
                fragmentsCount++;
            }
            this.logDataSent("LogMessages.DataSentHighThroughput",undefined,data.buffer);
            return packets;
        }else{
            this.logInfo("LogMessages.DataTooLarge");
            return;
        }
    }

    async initializeModule(){
        super.initializeModule();
        if(this.getMaxPayloadRequestSupport()){
            await BleClient.writeWithoutResponse(this.deviceId, PROTEUS_BLE_SERVICE, PROTEUS_BLE_RX_CHARACTERISTIC, this.formatmaxpayloadsize());
        }
        if(this.getGPIOSupport()){
            await BleClient.writeWithoutResponse(this.deviceId, PROTEUS_BLE_SERVICE, PROTEUS_BLE_RX_CHARACTERISTIC, this.formatreadpinconfiguration());
        }
    }

    getRemoteCommandSupport():Boolean{
        return (this.getMaxPayloadRequestSupport() || this.getGPIOSupport());
    }

    getHighThroughputModeSupport(): Boolean{
        return false;
    }

    getMaxPayloadRequestSupport(): Boolean{
        return false;
    }

    //#region GPIO send functions
    formatreadpinconfiguration():DataView{
        if(!this.getGPIOSupport()){
            return;
        }
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusCommand.CMD_GPIO_REMOTE_READCONFIG_REQ]);
        let fulldata = new Uint8Array(cmdheader.length + cmd.length);
        fulldata.set(cmdheader);
        fulldata.set(cmd, cmdheader.length);
        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_REMOTE_READCONFIG_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    };

    formatwritepinconfiguration(pins: GPIOPin[]):DataView{
        if(!this.getGPIOSupport()){
            return;
        }
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusCommand.CMD_GPIO_REMOTE_WRITECONFIG_REQ]);
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
        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_REMOTE_WRITECONFIG_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    };

    formatreadpinvalues(pins: GPIOPin[]):DataView{
        if(!this.getGPIOSupport()){
            return;
        }
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusCommand.CMD_GPIO_REMOTE_READ_REQ]);
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
        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_REMOTE_READ_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    };

    formatwritepinvalues(pins: GPIOPin[]):DataView{
        if(!this.getGPIOSupport()){
            return;
        }
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusCommand.CMD_GPIO_REMOTE_WRITE_REQ]);
        let data:number[] = [];
        for(let pin of pins){
            data = data.concat([0x02,pin.getPinID(),pin.getPinValue().getUint8(0)]);
        }
        let datauint8 = Uint8Array.from(data);
        let fulldata = new Uint8Array(cmdheader.length + cmd.length + datauint8.length);
        fulldata.set(cmdheader);
        fulldata.set(cmd, cmdheader.length);
        fulldata.set(datauint8, cmdheader.length + cmd.length);
        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GPIO_REMOTE_WRITE_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    };
    //#endregion

    formatmaxpayloadsize():DataView{
        if(!this.getMaxPayloadRequestSupport()){
            return;
        }
        let cmdheader = Uint8Array.from([ProteusHeader.RF_HEADER_TYPE_CMD]);
        let cmd = Uint8Array.from([ProteusCommand.CMD_GETSTATE_REQ]);
        let fulldata = new Uint8Array(cmdheader.length + cmd.length);
        fulldata.set(cmdheader);
        fulldata.set(cmd, cmdheader.length);
        this.logRemoteCommand(ProteusCommand[ProteusCommand.CMD_GETSTATE_REQ],undefined,fulldata.buffer);
        return new DataView(fulldata.buffer);
    }

    getGPIO(): GPIO{
        return this.proteusGPIO;
    }

    getDefaultMTUSize():number{
        return 247;
    }

}
