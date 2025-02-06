import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { GeneralBLEModule } from "../GeneralBLEModule";
import { GeneralBLEProfile } from "src/app/BLEProfiles/GeneralBLEProfile";
import { WESPPProfile } from "src/app/BLEProfiles/WESPPProfile";

export class StephanoI extends GeneralBLEModule{

    constructor(bledevice:BleDevice){
        super(bledevice);
    }

    getType(): BLEModuleType {
        return BLEModuleType.StephanoI;
    }
    
    getDefaultMTUSize():number{
        return 515;
    }

}
