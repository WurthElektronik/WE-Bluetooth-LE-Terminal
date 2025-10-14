import {
	BleCharacteristic,
	BleClient,
	BleService,
} from '@capacitor-community/bluetooth-le';
import { SPPBLEProfileType } from '../BLEProfiles/SPPBLEProfileType';
import { SPPBLEProfile } from '../BLEProfiles/SPPBLEProfile';

export abstract class TestSPPProfile extends SPPBLEProfile {
	static getType(): SPPBLEProfileType {
		throw new Error('not implemented.');
	}

	static getTypeString(): string {
		throw new Error('not implemented.');
	}

	static getService(): BleService {
		throw new Error('not implemented.');
	}

	static getUnacknowledgedDataRXCharacteristic(): BleCharacteristic {
		throw new Error('not implemented.');
	}

	static getUnacknowledgedDataTXCharacteristic(): BleCharacteristic {
		throw new Error('not implemented.');
	}

	static getAcknowledgedDataRXCharacteristic(): BleCharacteristic {
		throw new Error('not implemented.');
	}

	static getAcknowledgedDataTXCharacteristic(): BleCharacteristic {
		throw new Error('not implemented.');
	}

	static async sendDataUnacknowledged(deviceId: string, packet: DataView) {
		return;
	}

	static async startReceiveDataUnacknowledged(
		deviceId: string,
		callback: (value: DataView) => void,
		timeout: number,
	) {
		return;
	}

	static async stopReceiveDataUnacknowledged(deviceId: string) {
		return;
	}

	static async sendDataAcknowledged(deviceId: string, packet: DataView) {
		return;
	}

	static async startReceiveDataAcknowledged(
		deviceId: string,
		callback: (value: DataView) => void,
	) {
		return;
	}

	static async stopReceiveDataAcknowledged(deviceId: string) {
		return;
	}
}
