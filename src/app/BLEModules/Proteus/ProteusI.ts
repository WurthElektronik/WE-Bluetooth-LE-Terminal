import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { Proteus } from "./Proteus";

export class ProteusI extends Proteus{

    constructor(bledevice:BleDevice){
        super(bledevice);
    }

    getType(): BLEModuleType {
        return BLEModuleType.ProteusI;
    }

}