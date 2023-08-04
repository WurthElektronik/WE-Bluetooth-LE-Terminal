import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { GPIOPin } from "../GPIO/GPIOPin";
import { ProteusGPIO } from "./ProteusGPIO";

export class SetebosI extends ProteusGPIO{

    constructor(bledevice:BleDevice){
        super(bledevice);
        this.gpioPins = new Map<number, GPIOPin>([
            [2,new GPIOPin(2,"B2",false)],
            [3,new GPIOPin(3,"B3",true)],
            [4,new GPIOPin(4,"B4",true)],
            [5,new GPIOPin(5,"B5",true)],
            [6,new GPIOPin(6,"B6",true)]
        ]);
        this.resetTempGPIOPins(Array.from(this.gpioPins.values()));
    }

    getType(): BLEModuleType {
        return BLEModuleType.SetebosI;
    }

}