import {
	BleCharacteristic,
	BleClient,
	BleService,
} from '@capacitor-community/bluetooth-le';
import { SPPBLEProfileType } from './SPPBLEProfileType';
import { SPPBLEProfile } from './SPPBLEProfile';

export abstract class WESPP2Profile extends SPPBLEProfile {
	static getType(): SPPBLEProfileType {
		return SPPBLEProfileType.WESPP2;
	}

	static getTypeString(): string {
		return SPPBLEProfileType[SPPBLEProfileType.WESPP2];
	}

	static getService(): BleService {
		return {
			uuid: 'b70c0001-686c-4036-bb28-b797ae6a8d3a', // WESPP2 Service UUID
			characteristics: [
				{
					uuid: 'b70c0002-686c-4036-bb28-b797ae6a8d3a', // WESPP2 RX characteristic UUID
					properties: {
						broadcast: false,
						read: false,
						writeWithoutResponse: true,
						write: false,
						notify: false,
						indicate: false,
						authenticatedSignedWrites: false,
					},
					descriptors: [],
				},
				{
					uuid: 'b70c0003-686c-4036-bb28-b797ae6a8d3a', // WESPP2 TX characteristic UUID
					properties: {
						broadcast: false,
						read: false,
						writeWithoutResponse: false,
						write: false,
						notify: true,
						indicate: false,
						authenticatedSignedWrites: false,
					},
					descriptors: [],
				},
			],
		};
	}

	static getUnacknowledgedDataRXCharacteristic(): BleCharacteristic {
		return this.getService().characteristics[0];
	}

	static getUnacknowledgedDataTXCharacteristic(): BleCharacteristic {
		return this.getService().characteristics[1];
	}

	static getAcknowledgedDataRXCharacteristic(): BleCharacteristic {
		throw new Error('not implemented.');
	}

	static getAcknowledgedDataTXCharacteristic(): BleCharacteristic {
		throw new Error('not implemented.');
	}

	static async sendDataUnacknowledged(deviceId: string, packet: DataView) {
		await BleClient.writeWithoutResponse(
			deviceId,
			this.getService().uuid,
			this.getUnacknowledgedDataRXCharacteristic().uuid,
			packet,
		);
	}

	static async startReceiveDataUnacknowledged(
		deviceId: string,
		callback: (value: DataView) => void,
		timeout: number,
	) {
		await BleClient.startNotifications(
			deviceId,
			this.getService().uuid,
			this.getUnacknowledgedDataTXCharacteristic().uuid,
			callback,
			{ timeout: timeout },
		);
	}

	static async stopReceiveDataUnacknowledged(deviceId: string) {
		await BleClient.stopNotifications(
			deviceId,
			this.getService().uuid,
			this.getUnacknowledgedDataTXCharacteristic().uuid,
		);
	}

	static async sendDataAcknowledged(deviceId: string, packet: DataView) {
		throw new Error('not implemented.');
	}

	static async startReceiveDataAcknowledged(
		deviceId: string,
		callback: (value: DataView) => void,
	) {
		throw new Error('not implemented.');
	}

	static async stopReceiveDataAcknowledged(deviceId: string) {
		throw new Error('not implemented.');
	}
}
