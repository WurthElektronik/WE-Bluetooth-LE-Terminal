import { BleClient, BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { Proteus } from "./Proteus";
import { ProteusHeader } from "./ProteusHeader";

export class ProteusII extends Proteus{
    
    private fragmentsData:DataView[] = [];

    constructor(bledevice:BleDevice){
        super(bledevice);
    }

    getType(): BLEModuleType {
        return BLEModuleType.ProteusII;
    }

    handlerx(data: DataView): void {
        super.handlerx(data);
        switch(data.getUint8(0)){
            case ProteusHeader.RF_HEADER_TYPE_FRAGDATA:

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
                            if ((fragmentsCount != (this.fragmentsData[i].getUint8(2) & 0x0F)) ||
                            (data.getUint8(1) != this.fragmentsData[i].getUint8(1))){
                                return;
                            }else{
                                combinedData = combinedData.concat(Array.from(new Uint8Array(this.fragmentsData[i].buffer.slice(3))))
                            }
                        }
                        combinedData = combinedData.concat(Array.from(new Uint8Array(data.buffer.slice(3))))
                        this.logDataReceived("LogMessages.DataReceivedHighThroughput",undefined,new Uint8Array(combinedData).buffer);
                    }else{
                        this.fragmentsData[fragmentNumber-1] = data;
                    }
                }
                this.onDataReceived.next(undefined);
                break;
            default:
                break;
        }
    }

    async formatdatatx(data: DataView): Promise<DataView[]>{
        try {
            let mtu = await BleClient.getMtu(this.deviceId) - 3; //this -3 is for the Bluetooth Attribute Protocol
            if(data.byteLength <= (mtu - 1)){ // -1 is for the overhead of ProteusHeader.RF_HEADER_TYPE_DATA
                return super.formatdatatx(data);
            }else{
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
            }
        } catch (error) {
            return super.formatdatatx(data);
        }
    }
}