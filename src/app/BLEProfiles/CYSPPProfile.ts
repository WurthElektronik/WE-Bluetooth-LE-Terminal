import {
	BleCharacteristic,
	BleService,
} from '@capacitor-community/bluetooth-le';
import { SPPBLEProfileType } from './SPPBLEProfileType';
import { SPPBLEProfile, UUID_Ref } from './SPPBLEProfile';
import { SPPBLECharacteristicType } from './SPPBLECharacteristicType';
import { DataMode } from './DataMode';

const CYSPP_SERVICE_UUID_DEFAULT: string =
	'65333333-a115-11e2-9e9a-0800200ca100';
const CYSPP_UNACKNOWLEDGED_DATA_CHARACTERISTIC_DEFAULT: string =
	'65333333-a115-11e2-9e9a-0800200ca102';
const CYSPP_ACKNOWLEDGED_DATA_CHARACTERISTIC_DEFAULT: string =
	'65333333-a115-11e2-9e9a-0800200ca101';
const CYSPP_RX_FLOW_CONTROL_CHARACTERISTIC_DEFAULT: string =
	'65333333-a115-11e2-9e9a-0800200ca103';

export class CYSPPProfile extends SPPBLEProfile {
	/* Template Attributes */
	protected static readonly DefaultServiceUUID: string =
		CYSPP_SERVICE_UUID_DEFAULT;

	protected static readonly DefaultCharacteristicUUIDMap: Map<
		DataMode,
		Map<SPPBLECharacteristicType, string>
	> = new Map([
		[
			DataMode.UnacknowledgedData,
			new Map<SPPBLECharacteristicType, string>([
				[
					SPPBLECharacteristicType.RX,
					CYSPP_UNACKNOWLEDGED_DATA_CHARACTERISTIC_DEFAULT,
				],
				[
					SPPBLECharacteristicType.TX,
					CYSPP_UNACKNOWLEDGED_DATA_CHARACTERISTIC_DEFAULT,
				],
			]),
		],
		[
			DataMode.AcknowledgedData,
			new Map<SPPBLECharacteristicType, string>([
				[
					SPPBLECharacteristicType.RX,
					CYSPP_ACKNOWLEDGED_DATA_CHARACTERISTIC_DEFAULT,
				],
				[
					SPPBLECharacteristicType.TX,
					CYSPP_ACKNOWLEDGED_DATA_CHARACTERISTIC_DEFAULT,
				],
			]),
		],
	]);
	protected static ServiceUUID_Template = CYSPP_SERVICE_UUID_DEFAULT;

	protected static UNACKNOWLEDGED_DATA_UUID_Template: UUID_Ref = {
		value: CYSPP_UNACKNOWLEDGED_DATA_CHARACTERISTIC_DEFAULT,
	};

	protected static ACKNOWLEDGED_DATA_UUID_Template: UUID_Ref = {
		value: CYSPP_ACKNOWLEDGED_DATA_CHARACTERISTIC_DEFAULT,
	};

	protected static CharacteristicUUIDMap_Template: Map<
		DataMode,
		Map<SPPBLECharacteristicType, UUID_Ref>
	> = new Map([
		[
			DataMode.UnacknowledgedData,
			new Map<SPPBLECharacteristicType, UUID_Ref>([
				[
					SPPBLECharacteristicType.RX,
					CYSPPProfile.UNACKNOWLEDGED_DATA_UUID_Template,
				],
				[
					SPPBLECharacteristicType.TX,
					CYSPPProfile.UNACKNOWLEDGED_DATA_UUID_Template,
				],
			]),
		],
		[
			DataMode.AcknowledgedData,
			new Map<SPPBLECharacteristicType, UUID_Ref>([
				[
					SPPBLECharacteristicType.RX,
					CYSPPProfile.ACKNOWLEDGED_DATA_UUID_Template,
				],
				[
					SPPBLECharacteristicType.TX,
					CYSPPProfile.ACKNOWLEDGED_DATA_UUID_Template,
				],
			]),
		],
	]);

	/* Instance Attributes */
	protected readonly ServiceUUID: string;
	protected readonly UNACKNOWLEDGED_DATA_UUID: string;
	protected readonly ACKNOWLEDGED_DATA_UUID: string;

	protected readonly CharacteristicMap: Map<
		DataMode,
		Map<SPPBLECharacteristicType, BleCharacteristic>
	>;

	constructor() {
		super();
		this.ServiceUUID = CYSPPProfile.ServiceUUID_Template;
		this.UNACKNOWLEDGED_DATA_UUID =
			CYSPPProfile.UNACKNOWLEDGED_DATA_UUID_Template.value;
		this.ACKNOWLEDGED_DATA_UUID =
			CYSPPProfile.ACKNOWLEDGED_DATA_UUID_Template.value;
		this.CharacteristicMap = new Map([
			[
				DataMode.UnacknowledgedData,
				new Map<SPPBLECharacteristicType, BleCharacteristic>([
					[SPPBLECharacteristicType.RX, this.getService().characteristics[1]],
					[SPPBLECharacteristicType.TX, this.getService().characteristics[1]],
				]),
			],
			[
				DataMode.AcknowledgedData,
				new Map<SPPBLECharacteristicType, BleCharacteristic>([
					[SPPBLECharacteristicType.RX, this.getService().characteristics[0]],
					[SPPBLECharacteristicType.TX, this.getService().characteristics[0]],
				]),
			],
		]);
	}

	static getType(): SPPBLEProfileType {
		return SPPBLEProfileType.CYSPP;
	}

	getService(): BleService {
		return {
			uuid: this.ServiceUUID,
			characteristics: [
				{
					uuid: this.ACKNOWLEDGED_DATA_UUID,
					properties: {
						broadcast: false,
						read: false,
						writeWithoutResponse: false,
						write: true,
						notify: false,
						indicate: true,
						authenticatedSignedWrites: false,
					},
					descriptors: [],
				},
				{
					uuid: this.UNACKNOWLEDGED_DATA_UUID,
					properties: {
						broadcast: false,
						read: false,
						writeWithoutResponse: true,
						write: false,
						notify: true,
						indicate: false,
						authenticatedSignedWrites: false,
					},
					descriptors: [],
				},
				{
					uuid: CYSPP_RX_FLOW_CONTROL_CHARACTERISTIC_DEFAULT,
					properties: {
						broadcast: false,
						read: false,
						writeWithoutResponse: false,
						write: false,
						notify: false,
						indicate: true,
						authenticatedSignedWrites: false,
					},
					descriptors: [],
				},
			],
		};
	}

	getRXFlowCharacteristic(): BleCharacteristic {
		return this.getService().characteristics[2];
	}
}
