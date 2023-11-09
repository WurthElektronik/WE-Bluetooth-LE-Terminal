import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { Proteus } from "./Proteus";
import { ProteusHighThroughput } from "./ProteusHighThroughput";

export class ProteusII extends Proteus{
    
    constructor(bledevice:BleDevice){
        super(bledevice);
        this.proteusHighThroughput = new ProteusHighThroughput();
    }

    getType(): BLEModuleType {
        return BLEModuleType.ProteusII;
    }

    getHighThroughputModeSupport(): Boolean {
        return true && this.HIGHTHROUGHPUT_ENABLED;
    }
}
