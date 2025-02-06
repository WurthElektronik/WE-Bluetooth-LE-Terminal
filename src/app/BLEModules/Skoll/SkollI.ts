import { BleDevice } from "@capacitor-community/bluetooth-le";
import { BLEModuleType } from "../BLEModuleType";
import { GeneralBLEModule } from "../GeneralBLEModule";
import { GeneralBLEProfile } from "src/app/BLEProfiles/GeneralBLEProfile";
import { CYSPPProfile } from "src/app/BLEProfiles/CYSPPProfile";
import { DataMode } from "src/app/BLEProfiles/DataMode";

export class SkollI extends GeneralBLEModule{
    private dataMode:DataMode;

    constructor(bledevice:BleDevice, dataMode:DataMode = DataMode.UnacknowledgedData){
        super(bledevice);
        this.dataMode = dataMode;
    }

    getType(): BLEModuleType {
        return BLEModuleType.SkollI;
    }
    
    getDefaultMTUSize():number{
        return 131;
    }

    getDataMode():DataMode{
        return this.dataMode;
    }
}
