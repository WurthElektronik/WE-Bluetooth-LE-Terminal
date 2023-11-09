import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { GPIOPin } from "../GPIO/GPIOPin";
import { Proteus } from "./Proteus";
import { GPIO } from "../GPIO/GPIO";
import { ProteusHighThroughput } from "./ProteusHighThroughput";

export class ProteusIII extends Proteus{

    constructor(bledevice:BleDevice){
        super(bledevice);
        this.proteusGPIO = new GPIO(
            new Map<number, GPIOPin>([
                [1,new GPIOPin(1,"B1",false)],
                [2,new GPIOPin(2,"B2",false)],
                [3,new GPIOPin(3,"B3",true)],
                [4,new GPIOPin(4,"B4",true)],
                [5,new GPIOPin(5,"B5",true)],
                [6,new GPIOPin(6,"B6",true)]
            ])
        );
        this.proteusHighThroughput = new ProteusHighThroughput();
    }

    getType(): BLEModuleType {
        return BLEModuleType.ProteusIII;
    }

    getGPIOSupport(): Boolean {
        return true;
    }

    getHighThroughputModeSupport(): Boolean {
        return true && this.HIGHTHROUGHPUT_ENABLED;
    }

    getMaxPayloadRequestSupport(): Boolean{
        return true;
    }

}
