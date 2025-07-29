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
import { WESPPProfile } from '../BLEProfiles/WESPPProfile';
import { CYSPPProfile } from '../BLEProfiles/CYSPPProfile';
import { DataMode } from '../BLEProfiles/DataMode';
import { GeneralBLEProfile } from '../BLEProfiles/GeneralBLEProfile';
import { GenericAccessProfile } from '../BLEProfiles/GenericAccessProfile';

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
				WESPPProfile.getService().uuid,
				CYSPPProfile.getService().uuid,
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
			await BleClient.getServices(device.deviceId).then(async (services) => {
				if (services.length != 0) {
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
						return;
					}

					module.logInfo('LogMessages.ServicesDiscovered');
					this.connectedDevices.set(device.deviceId, module);
				}
			});
		}

		module.logInfo('LogMessages.ProfileUsed', {
			profile: SPPBLEProfileType[sppProfile.getType()],
		});

		var txcharacteristic: BleCharacteristic;

		switch (module.getDataMode()) {
			default:
			case DataMode.UnacknowledgedData:
				await sppProfile.startReceiveDataUnacknowledged(
					device.deviceId,
					(value) => {
						this.connectedDevices.get(device.deviceId).handlerx(value);
					},
				);
				txcharacteristic = sppProfile.getUnacknowledgedDataTXCharacteristic();
				break;
			case DataMode.AcknowledgedData:
				await sppProfile.startReceiveDataAcknowledged(
					device.deviceId,
					(value) => {
						this.connectedDevices.get(device.deviceId).handlerx(value);
					},
				);
				txcharacteristic = sppProfile.getAcknowledgedDataTXCharacteristic();
				break;
		}

		let descriptorvalue = await BleClient.readDescriptor(
			device.deviceId,
			sppProfile.getService().uuid,
			txcharacteristic.uuid,
			BLE_CCCD_UUID,
		);
		this.connectedDevices
			.get(device.deviceId)
			.logInfo('LogMessages.CCCDWritten', {
				descriptorvalue: HEX.BufferToEncoding(descriptorvalue.buffer),
				descriptor: BLE_CCCD_UUID,
				characteristic: txcharacteristic.uuid,
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

		await this.connectedDevices.get(device.deviceId).initializeModule();

		if (this.connectedDevices.get(device.deviceId).getMTUSize() != undefined) {
			await this.readmtu(device.deviceId);
		}
	}

	async disconnect(deviceid: string) {
		let module = this.connectedDevices.get(deviceid);
		let sppProfile = module.getSPPBLEProfile();
		var descriptorvalue: DataView;

		switch (module.getDataMode()) {
			default:
			case DataMode.UnacknowledgedData:
				descriptorvalue = await BleClient.readDescriptor(
					deviceid,
					sppProfile.getService().uuid,
					sppProfile.getUnacknowledgedDataTXCharacteristic().uuid,
					BLE_CCCD_UUID,
				);
				await sppProfile.stopReceiveDataUnacknowledged(deviceid);
				break;
			case DataMode.AcknowledgedData:
				descriptorvalue = await BleClient.readDescriptor(
					deviceid,
					sppProfile.getService().uuid,
					sppProfile.getAcknowledgedDataTXCharacteristic().uuid,
					BLE_CCCD_UUID,
				);
				await sppProfile.stopReceiveDataAcknowledged(deviceid);
				break;
		}
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
					let dataFormatted: DataView[] = await module.formatdatatx(data);
					for (let packet of dataFormatted) {
						switch (module.getDataMode()) {
							default:
							case DataMode.UnacknowledgedData:
								await sppProfile.sendDataUnacknowledged(deviceid, packet);
								break;
							case DataMode.AcknowledgedData:
								await sppProfile.sendDataAcknowledged(deviceid, packet);
								break;
						}
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

		switch (module.getDataMode()) {
			default:
			case DataMode.UnacknowledgedData:
				await sppProfile.sendDataUnacknowledged(deviceId, data);
				break;
			case DataMode.AcknowledgedData:
				await sppProfile.sendDataAcknowledged(deviceId, data);
				break;
		}
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
