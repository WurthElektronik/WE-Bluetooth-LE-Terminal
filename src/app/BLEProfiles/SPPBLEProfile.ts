import {
	BleCharacteristic,
	BleClient,
	BleService,
} from '@capacitor-community/bluetooth-le';
import { GeneralBLEProfile } from './GeneralBLEProfile';
import { SPPBLEProfileType } from './SPPBLEProfileType';
import { DataMode } from './DataMode';
import { SPPBLECharacteristicType } from './SPPBLECharacteristicType';

export type SPPBLEProfileClass = typeof SPPBLEProfile;

export type UUID_Ref = { value: string };

export abstract class SPPBLEProfile extends GeneralBLEProfile {
	/* Template Attributes */
	protected static readonly DefaultServiceUUID: string;

	protected static readonly DefaultCharacteristicUUIDMap: Map<
		DataMode,
		Map<SPPBLECharacteristicType, string>
	>;

	protected static ServiceUUID_Template: string;

	protected static CharacteristicUUIDMap_Template: Map<
		DataMode,
		Map<SPPBLECharacteristicType, UUID_Ref>
	>;

	/* Instance Attributes */
	protected readonly CharacteristicMap: Map<
		DataMode,
		Map<SPPBLECharacteristicType, BleCharacteristic>
	>;

	static getType(): SPPBLEProfileType {
		throw new Error('Not implemented');
	}

	static getTypeString(): string {
		return SPPBLEProfileType[this.getType()];
	}

	static getDefaultServiceUUID(): string {
		return this.DefaultServiceUUID;
	}

	static getDefaultCharacteristicUUID(
		data_mode: DataMode,
		characteristic_type: SPPBLECharacteristicType,
	): string {
		return this.DefaultCharacteristicUUIDMap.get(data_mode).get(
			characteristic_type,
		);
	}

	static getTemplateServiceUUID(): string {
		return this.ServiceUUID_Template;
	}

	static getTemplateCharacteristicUUID(
		data_mode: DataMode,
		characteristic_type: SPPBLECharacteristicType,
	): string {
		return this.CharacteristicUUIDMap_Template.get(data_mode).get(
			characteristic_type,
		).value;
	}

	static setTemplateServiceUUID(uuid: string) {
		this.ServiceUUID_Template = uuid;
	}

	static setTemplateCharacteristicUUID(
		data_mode: DataMode,
		characteristic_type: SPPBLECharacteristicType,
		uuid: string,
	) {
		this.CharacteristicUUIDMap_Template.get(data_mode).get(
			characteristic_type,
		).value = uuid;
	}

	getCharacteristic(
		data_mode: DataMode,
		characteristic_type: SPPBLECharacteristicType,
	): BleCharacteristic {
		let mode_chars = this.CharacteristicMap.get(data_mode);

		let typeString = (this.constructor as SPPBLEProfileClass).getTypeString();

		if (mode_chars == undefined) {
			throw new Error(`Unavailable mode ${data_mode} in ${typeString}.`);
		}

		let char = mode_chars.get(characteristic_type);

		if (char == undefined) {
			throw new Error(
				`Unavailable characteristic ${characteristic_type} in ${typeString}.`,
			);
		}

		return char;
	}

	static isAcknowledgedDataModeSupported(): boolean {
		return this.CharacteristicUUIDMap_Template.has(DataMode.AcknowledgedData);
	}

	static isSharedRXTXcharacteristic(): boolean {
		return (
			this.CharacteristicUUIDMap_Template.get(DataMode.UnacknowledgedData).get(
				SPPBLECharacteristicType.RX,
			) ===
			this.CharacteristicUUIDMap_Template.get(DataMode.UnacknowledgedData).get(
				SPPBLECharacteristicType.TX,
			)
		);
	}

	async sendData(deviceId: string, dataMode: DataMode, packet: DataView) {
		await BleClient.writeWithoutResponse(
			deviceId,
			this.getService().uuid,
			this.getCharacteristic(dataMode, SPPBLECharacteristicType.RX).uuid,
			packet,
		);
	}

	async startReceiveData(
		deviceId: string,
		dataMode: DataMode,
		callback: (value: DataView) => void,
		timeout: number,
	) {
		await BleClient.startNotifications(
			deviceId,
			this.getService().uuid,
			this.getCharacteristic(dataMode, SPPBLECharacteristicType.TX).uuid,
			callback,
			{ timeout: timeout },
		);
	}

	async stopReceiveData(deviceId: string, dataMode: DataMode) {
		await BleClient.stopNotifications(
			deviceId,
			this.getService().uuid,
			this.getCharacteristic(dataMode, SPPBLECharacteristicType.TX).uuid,
		);
	}
}
