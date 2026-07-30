import { Preferences } from '@capacitor/preferences';
import { HEX } from '../Encoders/HEX';
import { DataMode } from './DataMode';
import { SPPBLECharacteristicType } from './SPPBLECharacteristicType';
import { SPPBLEProfileType } from './SPPBLEProfileType';
import { SPPBLEProfileClass } from './SPPBLEProfile';

const SPPBLE_UUID_OVERRIDES_PREFERENCES_KEY: string = 'sppble_uuid_overrides';

type CharacteristicUUIDMap = Map<
	DataMode,
	Map<SPPBLECharacteristicType, string>
>;

type CharacteristicUUIDMapSerial = Record<string, Record<string, string>>;

interface ProfileUUIDConfig {
	ServiceUUID: string;
	CharacteristicUUIDs: CharacteristicUUIDMap;
}

export async function getSavedSPPBLEUUIDOverrides(
	profile: SPPBLEProfileClass,
): Promise<void> {
	let profileUUIDConfigJSONString = (
		await Preferences.get({
			key: `${SPPBLE_UUID_OVERRIDES_PREFERENCES_KEY}.${profile.getTypeString()}`,
		})
	).value;

	if (profileUUIDConfigJSONString == null) {
		throw new Error('Profile UUID not found');
	}

	let profileUUIDConfig: ProfileUUIDConfig = JSON.parse(
		profileUUIDConfigJSONString,
		macroJsonReviver,
	);

	profile.setTemplateServiceUUID(profileUUIDConfig.ServiceUUID);

	for (const [
		dataMode,
		charTypeMap,
	] of profileUUIDConfig.CharacteristicUUIDs.entries()) {
		for (const [charType, uuid] of charTypeMap.entries()) {
			profile.setTemplateCharacteristicUUID(dataMode, charType, uuid);
		}
	}
}

export async function setSavedSPPBLEUUIDOverrides(profile: SPPBLEProfileClass) {
	let profileUUIDConfig: ProfileUUIDConfig = {
		ServiceUUID: profile.getTemplateServiceUUID(),
		CharacteristicUUIDs: new Map([
			[
				DataMode.UnacknowledgedData,
				new Map<SPPBLECharacteristicType, string>([
					[
						SPPBLECharacteristicType.RX,
						profile.getTemplateCharacteristicUUID(
							DataMode.UnacknowledgedData,
							SPPBLECharacteristicType.RX,
						),
					],
					[
						SPPBLECharacteristicType.TX,
						profile.getTemplateCharacteristicUUID(
							DataMode.UnacknowledgedData,
							SPPBLECharacteristicType.TX,
						),
					],
				]),
			],
		]),
	};

	if (profile.isAcknowledgedDataModeSupported()) {
		profileUUIDConfig.CharacteristicUUIDs.set(
			DataMode.AcknowledgedData,
			new Map<SPPBLECharacteristicType, string>([
				[
					SPPBLECharacteristicType.RX,
					profile.getTemplateCharacteristicUUID(
						DataMode.AcknowledgedData,
						SPPBLECharacteristicType.RX,
					),
				],
				[
					SPPBLECharacteristicType.TX,
					profile.getTemplateCharacteristicUUID(
						DataMode.AcknowledgedData,
						SPPBLECharacteristicType.TX,
					),
				],
			]),
		);
	}

	await Preferences.set({
		key: `${SPPBLE_UUID_OVERRIDES_PREFERENCES_KEY}.${profile.getTypeString()}`,
		value: JSON.stringify(profileUUIDConfig, macroJsonReplacer),
	});
}

function macroJsonReplacer(key: string, value: any): any {
	switch (key) {
		case 'CharacteristicUUIDs': {
			const characteristicUUIDMap = value as CharacteristicUUIDMap;
			let out: CharacteristicUUIDMapSerial = {};
			for (const [dataMode, charTypeMap] of characteristicUUIDMap.entries()) {
				out[`${DataMode[dataMode]}`] = {};
				for (const [charType, uuid] of charTypeMap.entries()) {
					out[`${DataMode[dataMode]}`][
						`${SPPBLECharacteristicType[charType]}`
					] = `${uuid}`;
				}
			}
			return out;
		}
		default:
			return value;
	}
}

function macroJsonReviver(key: string, value: any): any {
	switch (key) {
		case 'CharacteristicUUIDs': {
			const characteristicUUIDMapSerial: CharacteristicUUIDMapSerial =
				value as CharacteristicUUIDMapSerial;
			let characteristicUUIDMap: CharacteristicUUIDMap = new Map();
			for (const [dataModeSerial, charTypeMapSerial] of Object.entries(
				characteristicUUIDMapSerial,
			)) {
				let dataMode: DataMode = DataMode[dataModeSerial];
				let charTypeMap: Map<SPPBLECharacteristicType, string> = new Map();
				for (const [charTypeSerial, uuid] of Object.entries(
					charTypeMapSerial,
				)) {
					let charType: SPPBLECharacteristicType =
						SPPBLECharacteristicType[charTypeSerial];
					charTypeMap.set(charType, uuid);
				}
				characteristicUUIDMap.set(dataMode, charTypeMap);
			}
			return characteristicUUIDMap;
		}
		default:
			return value;
	}
}
