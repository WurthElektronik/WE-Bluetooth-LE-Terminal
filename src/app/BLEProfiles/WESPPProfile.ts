import {
	BleCharacteristic,
	BleService,
} from '@capacitor-community/bluetooth-le';
import { SPPBLEProfileType } from './SPPBLEProfileType';
import { SPPBLEProfile, UUID_Ref } from './SPPBLEProfile';
import { DataMode } from './DataMode';
import { SPPBLECharacteristicType } from './SPPBLECharacteristicType';

const WESPP_SERVICE_UUID_DEFAULT: string =
	'6e400001-c352-11e5-953d-0002a5d5c51b';
const WESPP_RX_CHARACTERISTIC_DEFAULT: string =
	'6e400002-c352-11e5-953d-0002a5d5c51b';
const WESPP_TX_CHARACTERISTIC_DEFAULT: string =
	'6e400003-c352-11e5-953d-0002a5d5c51b';

export class WESPPProfile extends SPPBLEProfile {
	/* Template Attributes */
	protected static readonly DefaultServiceUUID: string =
		WESPP_SERVICE_UUID_DEFAULT;

	protected static readonly DefaultCharacteristicUUIDMap: Map<
		DataMode,
		Map<SPPBLECharacteristicType, string>
	> = new Map([
		[
			DataMode.UnacknowledgedData,
			new Map<SPPBLECharacteristicType, string>([
				[SPPBLECharacteristicType.RX, WESPP_RX_CHARACTERISTIC_DEFAULT],
				[SPPBLECharacteristicType.TX, WESPP_TX_CHARACTERISTIC_DEFAULT],
			]),
		],
	]);
	protected static ServiceUUID_Template = WESPP_SERVICE_UUID_DEFAULT;

	protected static RX_UUID_Template: UUID_Ref = {
		value: WESPP_RX_CHARACTERISTIC_DEFAULT,
	};

	protected static TX_UUID_Template: UUID_Ref = {
		value: WESPP_TX_CHARACTERISTIC_DEFAULT,
	};

	protected static CharacteristicUUIDMap_Template: Map<
		DataMode,
		Map<SPPBLECharacteristicType, UUID_Ref>
	> = new Map([
		[
			DataMode.UnacknowledgedData,
			new Map<SPPBLECharacteristicType, UUID_Ref>([
				[SPPBLECharacteristicType.RX, WESPPProfile.RX_UUID_Template],
				[SPPBLECharacteristicType.TX, WESPPProfile.TX_UUID_Template],
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
		this.ServiceUUID = WESPPProfile.ServiceUUID_Template;
		this.RX_UUID = WESPPProfile.RX_UUID_Template.value;
		this.TX_UUID = WESPPProfile.TX_UUID_Template.value;
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
		return SPPBLEProfileType.WESPP;
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
						write: true,
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
