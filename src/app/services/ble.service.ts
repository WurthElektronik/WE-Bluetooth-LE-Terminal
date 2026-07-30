import { Injectable, NgZone } from '@angular/core';
import {
	BleCharacteristic,
	BleClient,
	BleDevice,
	BleService as BleServiceLibrary,
	ConnectionPriority,
	RequestBleDeviceOptions,
	ScanResult,
} from '@capacitor-community/bluetooth-le';
import { Subject } from 'rxjs';
import { GeneralBLEModule } from '../BLEModules/GeneralBLEModule';
import { BLEModuleType } from '../BLEModules/BLEModuleType';
import { ProteusIV } from '../BLEModules/Proteus/ProteusIV';
import { ProteusIII } from '../BLEModules/Proteus/ProteusIII';
import { ProteusI } from '../BLEModules/Proteus/ProteusI';
import { ProteusII } from '../BLEModules/Proteus/ProteusII';
import { Proteuse } from '../BLEModules/Proteus/Proteuse';
import { SetebosI } from '../BLEModules/Proteus/SetebosI';
import { StephanoI } from '../BLEModules/Stephano/StephanoI';
import { ScanFilter } from '../Filters/ScanFilter';
import { FilterType } from '../Filters/FilterType';
import { ServiceUUIDFilter } from '../Filters/ServiceUUIDFilter';
import { NameFilter } from '../Filters/NameFilter';
import { HEX } from '../Encoders/HEX';
import { BLE_CCCD_UUID, CCCD_Value } from '../BLEProfiles/CCCD';
import { SkollI } from '../BLEModules/Skoll/SkollI';
import { SPPBLEProfileType } from '../BLEProfiles/SPPBLEProfileType';
import { DataMode } from '../BLEProfiles/DataMode';
import { GeneralBLEProfile } from '../BLEProfiles/GeneralBLEProfile';
import { GenericAccessProfile } from '../BLEProfiles/GenericAccessProfile';
import { SPPBLECharacteristicType } from '../BLEProfiles/SPPBLECharacteristicType';
import { BLE_PROFILES } from '../BLEProfiles/SPPBLEProfile.registry';
import { SPPBLEProfileClass } from '../BLEProfiles/SPPBLEProfile';

const START_NOTIFICATION_TIMEOUT_MS: number = 30000;

export interface TxLogEntry {
	txData: DataView;
	logCallback: () => void;
}

@Injectable({
	providedIn: 'root',
})
export class BleService {
	connectedDevices: Map<string, GeneralBLEModule> = new Map<
		string,
		GeneralBLEModule
	>();

	public onDeviceDisconnected: Subject<any> = new Subject<any>();

	constructor() {}

	private static getRequestBleDeviceOptions(
		filters: Map<FilterType, ScanFilter[]>,
	): RequestBleDeviceOptions {
		let serviceUUIDFilters: ServiceUUIDFilter[] = filters.get(
			FilterType.ServiceUUID,
		) as ServiceUUIDFilter[];
		let nameFilter: NameFilter[] = filters.get(FilterType.Name) as NameFilter[];
		return {
			services: serviceUUIDFilters
				? serviceUUIDFilters.map((filter) => filter.getServiceUUID())
				: undefined,
			optionalServices: [
				...BLE_PROFILES.map((p) => p.getTemplateServiceUUID()),
				GenericAccessProfile.getService().uuid,
			],
			namePrefix: nameFilter ? nameFilter[0].getName() : undefined,
			allowDuplicates: true,
		};
	}

	async startscan(
		filters: Map<FilterType, ScanFilter[]>,
		callback: (scanresult: ScanResult) => void,
	) {
		try {
			let requestBLEDeviceOptions: RequestBleDeviceOptions =
				BleService.getRequestBleDeviceOptions(filters);
			await BleClient.requestLEScan(requestBLEDeviceOptions, (result) => {
				callback(result);
			});
		} catch (error) {}
	}

	async requestdevice(
		filters: Map<FilterType, ScanFilter[]>,
		callback: (paireddevice: BleDevice) => void,
	) {
		try {
			let requestBLEDeviceOptions: RequestBleDeviceOptions =
				BleService.getRequestBleDeviceOptions(filters);
			let device = await BleClient.requestDevice(requestBLEDeviceOptions);
			callback(device);
		} catch (error) {
			callback(undefined);
		}
	}

	async stopscan() {
		try {
			await BleClient.stopLEScan();
		} catch (error) {}
	}

	private static checkBLEProfileCompatability(
		bleProfile: GeneralBLEProfile,
		services: BleServiceLibrary[],
		checkProperties: boolean,
	): boolean {
		let ble_device_service = services.find(
			(x) => x.uuid === bleProfile.getService().uuid,
		);
		if (ble_device_service == undefined) {
			return false;
		}

		for (let characteristic of bleProfile.getService().characteristics) {
			let ble_profile_characteristic = ble_device_service.characteristics.find(
				(x) => x.uuid === characteristic.uuid,
			);
			if (ble_profile_characteristic == undefined) {
				return false;
			}

			if (!checkProperties) {
				continue;
			}

			for (let property of Object.keys(characteristic.properties)) {
				if (
					characteristic.properties[property] !=
					ble_profile_characteristic.properties[property]
				) {
					return false;
				}
			}
		}

		return true;
	}

	async connect(
		device: BleDevice,
		moduletype: BLEModuleType,
		dataMode: DataMode,
	) {
		await BleClient.disconnect(device.deviceId);

		var module: GeneralBLEModule = undefined;
		switch (moduletype) {
			case BLEModuleType.ProteusI:
				module = new ProteusI(device);
				break;
			case BLEModuleType.ProteusII:
				module = new ProteusII(device);
				break;
			case BLEModuleType.ProteusIII:
				module = new ProteusIII(device);
				break;
			case BLEModuleType.ProteusIV:
				module = new ProteusIV(device);
				break;
			case BLEModuleType.Proteuse:
				module = new Proteuse(device);
				break;
			case BLEModuleType.SetebosI:
				module = new SetebosI(device);
				break;
			case BLEModuleType.StephanoI:
				module = new StephanoI(device);
				break;
			case BLEModuleType.SkollI:
				module = new SkollI(device, dataMode);
				break;
			default:
				return;
		}

		await BleClient.connect(device.deviceId, (deviceid) => {
			this.connectedDevices.delete(deviceid);
			this.onDeviceDisconnected.next(deviceid);
		});

		module.logInfo('LogMessages.DeviceConnected');

		let sppProfile = module.getSPPBLEProfile();

		while (!this.connectedDevices.has(device.deviceId)) {
			const services = await BleClient.getServices(device.deviceId);

			if (services.length == 0) {
				continue;
			}

			if (
				BleService.checkBLEProfileCompatability(
					GenericAccessProfile,
					services,
					false,
				)
			) {
				module.setDeviceName(
					await GenericAccessProfile.readDeviceName(device.deviceId),
				);
			}

			if (
				!BleService.checkBLEProfileCompatability(sppProfile, services, true)
			) {
				await BleClient.disconnect(device.deviceId);
				throw new Error('Incompatable SPP Profile');
			}

			module.logInfo('LogMessages.ServicesDiscovered');
			this.connectedDevices.set(device.deviceId, module);
		}

		let sppProfileTemplate = sppProfile.constructor as SPPBLEProfileClass;

		module.logInfo('LogMessages.ProfileUsed', {
			profile: SPPBLEProfileType[sppProfileTemplate.getType()],
		});

		var txcharacteristic: BleCharacteristic;

		var descriptorvalue: DataView;

		try {
			await sppProfile.startReceiveData(
				device.deviceId,
				module.getDataMode(),
				(value) => {
					this.connectedDevices.get(device.deviceId).handlerx(value);
				},
				START_NOTIFICATION_TIMEOUT_MS,
			);

			txcharacteristic = sppProfile.getCharacteristic(
				module.getDataMode(),
				SPPBLECharacteristicType.TX,
			);

			descriptorvalue = await BleClient.readDescriptor(
				device.deviceId,
				sppProfile.getService().uuid,
				txcharacteristic.uuid,
				BLE_CCCD_UUID,
			);
		} catch (error) {
			await BleClient.disconnect(device.deviceId);
			throw error;
		}

		this.connectedDevices
			.get(device.deviceId)
			.logInfo('LogMessages.CCCDWritten', {
				descriptorvalue: HEX.BufferToEncoding(
					descriptorvalue.buffer,
				).toUpperCase(),
				descriptor: BLE_CCCD_UUID.toUpperCase(),
				characteristic: txcharacteristic.uuid.toUpperCase(),
			});

		switch (descriptorvalue.getUint16(0, true)) {
			default:
			case CCCD_Value.Notification: {
				this.connectedDevices
					.get(device.deviceId)
					.logInfo('LogMessages.NotificationsEnabled');
				break;
			}
			case CCCD_Value.Indication: {
				this.connectedDevices
					.get(device.deviceId)
					.logInfo('LogMessages.IndicationsEnabled');
				break;
			}
		}

		try {
			await this.connectedDevices.get(device.deviceId).initializeModule();
		} catch (error) {
			await BleClient.disconnect(device.deviceId);
			throw error;
		}

		if (this.connectedDevices.get(device.deviceId).getMTUSize() != undefined) {
			await this.readmtu(device.deviceId);
		}
	}

	async disconnect(deviceid: string) {
		let module = this.connectedDevices.get(deviceid);
		let sppProfile = module.getSPPBLEProfile();
		var descriptorvalue: DataView;

		descriptorvalue = await BleClient.readDescriptor(
			deviceid,
			sppProfile.getService().uuid,
			sppProfile.getCharacteristic(
				module.getDataMode(),
				SPPBLECharacteristicType.TX,
			).uuid,
			BLE_CCCD_UUID,
		);

		await sppProfile.stopReceiveData(deviceid, module.getDataMode());

		switch (descriptorvalue.getUint16(0, true)) {
			default:
			case CCCD_Value.Notification: {
				this.connectedDevices
					.get(deviceid)
					.logInfo('LogMessages.NotificationsDisabled');
				break;
			}
			case CCCD_Value.Indication: {
				this.connectedDevices
					.get(deviceid)
					.logInfo('LogMessages.IndicationsDisabled');
				break;
			}
		}
		await BleClient.disconnect(deviceid);
	}

	async senddata(
		deviceId: string,
		data: DataView,
		sendCount: number,
		sendDelay: number,
	) {
		let deviceIDs: string[] =
			deviceId == undefined
				? Array.from(this.connectedDevices.keys())
				: [deviceId];
		deviceIDs.forEach(async (deviceid) => {
			let module = this.connectedDevices.get(deviceid);
			try {
				module.setSending(true);
				let sppProfile = module.getSPPBLEProfile();
				for (let i = 0; i < sendCount; i++) {
					let dataFormatted: TxLogEntry[] = await module.formatdatatx(data);
					for (let packet of dataFormatted) {
						await sppProfile.sendData(
							deviceid,
							module.getDataMode(),
							packet.txData,
						);
						packet.logCallback();
					}
					if (i != sendCount - 1) {
						await new Promise((f) => setTimeout(f, sendDelay));
					}
				}
				module.setSending(false);
			} catch (error) {
				module.setSending(false);
			}
		});
	}

	async senddataunformatted(deviceId: string, data: DataView) {
		let module = this.connectedDevices.get(deviceId);
		let sppProfile = module.getSPPBLEProfile();
		await sppProfile.sendData(deviceId, module.getDataMode(), data);
	}

	async readrssi(deviceId: string) {
		let rssi = await BleClient.readRssi(deviceId);
		this.connectedDevices.get(deviceId).logInfo(`RSSI : ${rssi} dBm`);
	}

	async readmtu(deviceId: string) {
		let mtu = this.connectedDevices.get(deviceId).getMTUSize();
		this.connectedDevices.get(deviceId).logInfo(`MTU : ${mtu}`);
	}

	async requestpriority(deviceId: string, priority: ConnectionPriority) {
		await BleClient.requestConnectionPriority(deviceId, priority);
		this.connectedDevices
			.get(deviceId)
			.logInfo('LogMessages.RequestedConnectionPriority', {
				priority: ConnectionPriority[priority],
			});
	}
}
