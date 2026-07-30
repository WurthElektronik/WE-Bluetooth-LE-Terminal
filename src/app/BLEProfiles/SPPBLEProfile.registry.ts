import { CYSPPProfile } from './CYSPPProfile';
import { SPPBLEProfileClass } from './SPPBLEProfile';
import { WESPP2Profile } from './WESPP2Profile';
import { WESPPProfile } from './WESPPProfile';

export const BLE_PROFILES: SPPBLEProfileClass[] = [
	WESPPProfile,
	WESPP2Profile,
	CYSPPProfile,
];
