import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "./BLEModuleType";
import { Logger } from "../Logger/Logger";
import { LogMessageType } from "../Logger/LogMessageType";
import { Subject } from 'rxjs';

export abstract class GeneralBLEModule{
    private devicename:string;
    deviceId:string;
    protected logger:Logger = new Logger();
    onDataReceived: Subject<any> = new Subject<any>();

    constructor(bledevice:BleDevice){
        this.devicename = bledevice.name;
        this.deviceId = bledevice.deviceId;
    }

    abstract getType():BLEModuleType;
    
    logInfo(msginfo:string, msginfoparameters: any = undefined){
        this.logger.logMessage(LogMessageType.Info,msginfo,msginfoparameters);
    }

    logDataSent(msginfo:string, msginfoparameters: any = undefined, msgdata:ArrayBuffer = undefined){
        this.logger.logMessage(LogMessageType.DataSent,msginfo,msginfoparameters,msgdata);
    }

    logDataReceived(msginfo:string, msginfoparameters: any = undefined, msgdata:ArrayBuffer = undefined){
        this.logger.logMessage(LogMessageType.DataReceived,msginfo,msginfoparameters,msgdata);
    }

    getDeviceName():string{
        return this.devicename;
    }

    getLogMessages(types:LogMessageType[] = []){
        return this.logger.getMessages(types);
    }

    getGPIOSupport():Boolean{
        return false;
    }

    handlerx(data: DataView){
        this.logDataReceived("LogMessages.DataReceived",undefined,data.buffer);
        this.onDataReceived.next(undefined);
    }

    async formatdatatx(data: DataView): Promise<DataView[]>{
        this.logDataSent("LogMessages.DataSent",undefined,data.buffer);
        return [data];
    }

    getLoggerDataLoggedSubject(): Subject<any>{
        return this.logger.getDataLoggedSubject();
    }

    getDataReceivedSubject():Subject<any>{
        return this.onDataReceived;
    }

    async initializeModule(){
        return;
    }

}