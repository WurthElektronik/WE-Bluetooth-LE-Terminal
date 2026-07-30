import {
	BleCharacteristic,
	BleClient,
	BleService,
} from '@capacitor-community/bluetooth-le';
import { SPPBLEProfileType } from '../BLEProfiles/SPPBLEProfileType';
import { SPPBLEProfile } from '../BLEProfiles/SPPBLEProfile';
import { DataMode } from '../BLEProfiles/DataMode';
import { testModuleInstance } from './TestBLEDevice';

export class TestSPPProfile extends SPPBLEProfile {
	static getType(): SPPBLEProfileType {
		throw new Error('not implemented.');
	}

	static getTypeString(): string {
		throw new Error('not implemented.');
	}

	getService(): BleService {
		throw new Error('not implemented.');
	}

	async sendData(deviceId: string, dataMode: DataMode, packet: DataView) {
		return;
	}
}
