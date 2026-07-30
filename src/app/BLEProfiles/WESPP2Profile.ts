import {
	BleCharacteristic,
	BleService,
} from '@capacitor-community/bluetooth-le';
import { SPPBLEProfileType } from './SPPBLEProfileType';
import { SPPBLEProfile, UUID_Ref } from './SPPBLEProfile';
import { DataMode } from './DataMode';
import { SPPBLECharacteristicType } from './SPPBLECharacteristicType';

const WESPP2_SERVICE_UUID_DEFAULT: string =
	'b70c0001-686c-4036-bb28-b797ae6a8d3a';
const WESPP2_RX_CHARACTERISTIC_DEFAULT: string =
	'b70c0002-686c-4036-bb28-b797ae6a8d3a';
const WESPP2_TX_CHARACTERISTIC_DEFAULT: string =
	'b70c0003-686c-4036-bb28-b797ae6a8d3a';

export class WESPP2Profile extends SPPBLEProfile {
	/* Template Attributes */
	protected static readonly DefaultServiceUUID: string =
		WESPP2_SERVICE_UUID_DEFAULT;

	protected static readonly DefaultCharacteristicUUIDMap: Map<
		DataMode,
		Map<SPPBLECharacteristicType, string>
	> = new Map([
		[
			DataMode.UnacknowledgedData,
			new Map<SPPBLECharacteristicType, string>([
				[SPPBLECharacteristicType.RX, WESPP2_RX_CHARACTERISTIC_DEFAULT],
				[SPPBLECharacteristicType.TX, WESPP2_TX_CHARACTERISTIC_DEFAULT],
			]),
		],
	]);

	protected static ServiceUUID_Template = WESPP2_SERVICE_UUID_DEFAULT;

	protected static RX_UUID_Template: UUID_Ref = {
		value: WESPP2_RX_CHARACTERISTIC_DEFAULT,
	};

	protected static TX_UUID_Template: UUID_Ref = {
		value: WESPP2_TX_CHARACTERISTIC_DEFAULT,
	};

	protected static CharacteristicUUIDMap_Template: Map<
		DataMode,
		Map<SPPBLECharacteristicType, UUID_Ref>
	> = new Map([
		[
			DataMode.UnacknowledgedData,
			new Map<SPPBLECharacteristicType, UUID_Ref>([
				[SPPBLECharacteristicType.RX, WESPP2Profile.RX_UUID_Template],
				[SPPBLECharacteristicType.TX, WESPP2Profile.TX_UUID_Template],
			]),
		],
	]);

	/* Instance Attributes */
	protected readonly ServiceUUID: string;
	protected readonly RX_UUID: string;
	protected readonly TX_UUID: string;

	protected readonly CharacteristicMap: Map<
		DataMode,
		Map<SPPBLECharacteristicType, BleCharacteristic>
	>;

	constructor() {
		super();
		this.ServiceUUID = WESPP2Profile.ServiceUUID_Template;
		this.RX_UUID = WESPP2Profile.RX_UUID_Template.value;
		this.TX_UUID = WESPP2Profile.TX_UUID_Template.value;
		this.CharacteristicMap = new Map([
			[
				DataMode.UnacknowledgedData,
				new Map<SPPBLECharacteristicType, BleCharacteristic>([
					[SPPBLECharacteristicType.RX, this.getService().characteristics[0]],
					[SPPBLECharacteristicType.TX, this.getService().characteristics[1]],
				]),
			],
		]);
	}

	static getType(): SPPBLEProfileType {
		return SPPBLEProfileType.WESPP2;
	}

	getService(): BleService {
		return {
			uuid: this.ServiceUUID,
			characteristics: [
				{
					uuid: this.RX_UUID,
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
					uuid: this.TX_UUID,
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
}
