import { BleCharacteristic, BleService } from "@capacitor-community/bluetooth-le";
import { BLEProfileType } from "./BLEProfileType";

export abstract class GeneralBLEProfile{

    abstract getType():BLEProfileType;

    abstract getTypeString():string;

    abstract getService():BleService;

    abstract sendDataUnacknowledged(deviceId: string, packet: DataView);

    abstract startReceiveDataUnacknowledged(deviceId: string, callback: (value: DataView) => void);

    abstract stopReceiveDataUnacknowledged(deviceId: string);

    abstract sendDataAcknowledged(deviceId: string, packet: DataView);

    abstract startReceiveDataAcknowledged(deviceId: string, callback: (value: DataView) => void);

    abstract stopReceiveDataAcknowledged(deviceId: string);

    abstract getUnacknowledgedDataRXCharacteristic():BleCharacteristic;

    abstract getUnacknowledgedDataTXCharacteristic():BleCharacteristic;

    abstract getAcknowledgedDataRXCharacteristic():BleCharacteristic;

    abstract getAcknowledgedDataTXCharacteristic():BleCharacteristic;
}
