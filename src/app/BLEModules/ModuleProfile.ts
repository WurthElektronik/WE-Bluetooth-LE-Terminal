import { CYSPPProfile } from "../BLEProfiles/CYSPPProfile";
import { GeneralBLEProfile } from "../BLEProfiles/GeneralBLEProfile";
import { WESPPProfile } from "../BLEProfiles/WESPPProfile";
import { BLEModuleType } from "./BLEModuleType";

export const module_profile:Map<BLEModuleType, GeneralBLEProfile> = new Map<BLEModuleType, GeneralBLEProfile>([
    [BLEModuleType.ProteusI, WESPPProfile],
    [BLEModuleType.ProteusII, WESPPProfile],
    [BLEModuleType.ProteusIII, WESPPProfile],
    [BLEModuleType.Proteuse, WESPPProfile],
    [BLEModuleType.SetebosI, WESPPProfile],
    [BLEModuleType.StephanoI, WESPPProfile],
    [BLEModuleType.SkollI, CYSPPProfile]
]);
