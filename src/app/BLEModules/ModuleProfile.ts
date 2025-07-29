import { CYSPPProfile } from '../BLEProfiles/CYSPPProfile';
import { SPPBLEProfile } from '../BLEProfiles/SPPBLEProfile';
import { WESPPProfile } from '../BLEProfiles/WESPPProfile';
import { BLEModuleType } from './BLEModuleType';

export const module_profile: Map<BLEModuleType, SPPBLEProfile> = new Map<
	BLEModuleType,
	SPPBLEProfile
>([
	[BLEModuleType.ProteusI, WESPPProfile],
	[BLEModuleType.ProteusII, WESPPProfile],
	[BLEModuleType.ProteusIII, WESPPProfile],
	[BLEModuleType.Proteuse, WESPPProfile],
	[BLEModuleType.SetebosI, WESPPProfile],
	[BLEModuleType.StephanoI, WESPPProfile],
	[BLEModuleType.SkollI, CYSPPProfile],
]);
