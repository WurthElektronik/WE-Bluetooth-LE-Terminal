import { BleClient, BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "./BLEModuleType";
import { Logger } from "../Logger/Logger";
import { LogMessageType } from "../Logger/LogMessageType";
import { Subject } from 'rxjs';
import { GeneralBLEProfile } from "../BLEProfiles/GeneralBLEProfile";
import { DataMode } from "../BLEProfiles/DataMode";
import { module_profile } from "./ModuleProfile";

export abstract class GeneralBLEModule{
    private devicename:string;
    deviceId:string;
    protected logger:Logger = new Logger();
    onDataReceived: Subject<any> = new Subject<any>();
    sending:Boolean = false;
    mtuSize:number = undefined;

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

    logRemoteCommand(msginfo:string, msginfoparameters: any = undefined, msgdata:ArrayBuffer = undefined){
        this.logger.logMessage(LogMessageType.RemoteCommand,msginfo,msginfoparameters,msgdata);
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

    getRemoteCommandSupport():Boolean{
        return false;
    }

    handlerx(data: DataView){
        this.logDataReceived("LogMessages.DataReceived",undefined,data.buffer);
        this.onDataReceived.next(undefined);
    }

    async formatdatatx(data: DataView): Promise<DataView[]>{
        var mtu = this.getMTUSize() || this.getDefaultMTUSize();
        mtu -= 3; //this -3 is for the Bluetooth Attribute Protocol
        if(data.byteLength > mtu){
            this.logInfo("LogMessages.DataTooLarge");
            return;
        }
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
        try {
            this.setMTUSize(await BleClient.getMtu(this.deviceId));
        } catch (error) {
        }
    }

    isSending():Boolean{
        return this.sending;
    }

    setSending(sending:Boolean){
        this.sending = sending;
    }

    getMTUSize():number{
        return this.mtuSize;
    }

    setMTUSize(mtuSize: number){
        this.mtuSize = mtuSize;
    }

    getDefaultMTUSize():number{
        return 23;
    }

    getBLEProfile():GeneralBLEProfile{
        return module_profile.get(this.getType());
    }

    getDataMode():DataMode{
        return DataMode.UnacknowledgedData;
    }
}
