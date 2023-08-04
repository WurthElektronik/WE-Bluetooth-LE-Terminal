import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { GeneralBLEModule } from "../GeneralBLEModule";

export class StephanoI extends GeneralBLEModule{

    constructor(bledevice:BleDevice){
        super(bledevice);
    }

    getType(): BLEModuleType {
        return BLEModuleType.StephanoI;
    }

}