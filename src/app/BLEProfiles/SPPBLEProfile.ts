import {
	BleCharacteristic,
	BleService,
} from '@capacitor-community/bluetooth-le';
import { GeneralBLEProfile } from './GeneralBLEProfile';
import { SPPBLEProfileType } from './SPPBLEProfileType';

export abstract class SPPBLEProfile extends GeneralBLEProfile {
	abstract getType(): SPPBLEProfileType;

	abstract getTypeString(): string;

	abstract sendDataUnacknowledged(deviceId: string, packet: DataView);

	abstract startReceiveDataUnacknowledged(
		deviceId: string,
		callback: (value: DataView) => void,
		timeout: number,
	);

	abstract stopReceiveDataUnacknowledged(deviceId: string);

	abstract sendDataAcknowledged(deviceId: string, packet: DataView);

	abstract startReceiveDataAcknowledged(
		deviceId: string,
		callback: (value: DataView) => void,
		timeout: number,
	);

	abstract stopReceiveDataAcknowledged(deviceId: string);

	abstract getUnacknowledgedDataRXCharacteristic(): BleCharacteristic;

	abstract getUnacknowledgedDataTXCharacteristic(): BleCharacteristic;

	abstract getAcknowledgedDataRXCharacteristic(): BleCharacteristic;

	abstract getAcknowledgedDataTXCharacteristic(): BleCharacteristic;
}
