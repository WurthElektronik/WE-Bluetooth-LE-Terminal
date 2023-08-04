import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { GPIOPin } from "../GPIO/GPIOPin";
import { ProteusGPIO } from "./ProteusGPIO";

export class Proteuse extends ProteusGPIO{

    constructor(bledevice:BleDevice){
        super(bledevice);
        this.gpioPins = new Map<number, GPIOPin>([
            [1,new GPIOPin(1,"B1",false)],
            [2,new GPIOPin(2,"B2",false)],
        ]);
        this.resetTempGPIOPins(Array.from(this.gpioPins.values()));
    }

    getType(): BLEModuleType {
        return BLEModuleType.Proteuse;
    }

}