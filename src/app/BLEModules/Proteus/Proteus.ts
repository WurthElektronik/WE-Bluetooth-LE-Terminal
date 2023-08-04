import { BleDevice } from "@capacitor-community/bluetooth-le";
import { GeneralBLEModule } from "../GeneralBLEModule";
import { ProteusHeader } from "./ProteusHeader";

export abstract class Proteus extends GeneralBLEModule{

    constructor(bledevice:BleDevice){
        super(bledevice);
    }

    handlerx(data: DataView): void {
        switch(data.getUint8(0)){
            case ProteusHeader.RF_HEADER_TYPE_DATA:
                this.logDataReceived("LogMessages.DataReceived",undefined,data.buffer.slice(1));
                break;
            default:
                break;
        }
        this.onDataReceived.next(undefined);
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

}