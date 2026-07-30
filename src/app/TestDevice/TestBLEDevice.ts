import { BleDevice, ScanResult } from '@capacitor-community/bluetooth-le';
import { TestModule } from './TestModule';

export const testdevice: BleDevice = {
	deviceId: 'testid123',
	name: 'Test Device',
};

export const testscanresult: ScanResult = {
	device: testdevice,
	localName: 'Test Device',
	rssi: -65,
};

export const testModuleInstance: TestModule = new TestModule(testdevice);
