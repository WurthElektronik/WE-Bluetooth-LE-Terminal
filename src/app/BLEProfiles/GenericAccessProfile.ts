import {
	BleCharacteristic,
	BleClient,
	BleService,
	numberToUUID,
} from '@capacitor-community/bluetooth-le';
import { GeneralBLEProfile } from './GeneralBLEProfile';
import { ASCII } from '../Encoders/ASCII';

export abstract class GenericAccessProfile extends GeneralBLEProfile {
	static getService(): BleService {
		return {
			uuid: numberToUUID(0x1800), // Generic Access Service UUID
			characteristics: [
				{
					uuid: numberToUUID(0x2a00), // Device Name characteristic UUID
					properties: {
						broadcast: false,
						read: true,
						writeWithoutResponse: false,
						write: false,
						notify: false,
						indicate: false,
						authenticatedSignedWrites: false,
					},
					descriptors: [],
				},
			],
		};
	}

	static getDeviceNameCharacteristic(): BleCharacteristic {
		return this.getService().characteristics[0];
	}

	static async readDeviceName(deviceId: string): Promise<string> {
		let deviceNameBuffer: DataView = await BleClient.read(
			deviceId,
			this.getService().uuid,
			this.getDeviceNameCharacteristic().uuid,
		);
		return ASCII.BufferToEncoding(deviceNameBuffer.buffer);
	}
}
