import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { GPIOPin } from "../GPIO/GPIOPin";
import { Proteus } from "./Proteus";
import { GPIO } from "../GPIO/GPIO";

export class Proteuse extends Proteus{

    constructor(bledevice:BleDevice){
        super(bledevice);
        this.proteusGPIO = new GPIO(
            new Map<number, GPIOPin>([
                [1,new GPIOPin(1,"B1",false)],
                [2,new GPIOPin(2,"B2",false)],
            ])
        );
    }

    getType(): BLEModuleType {
        return BLEModuleType.Proteuse;
    }

    getGPIOSupport(): Boolean {
        return true;
    }

    getMaxPayloadRequestSupport(): Boolean{
        return true;
    }

}
