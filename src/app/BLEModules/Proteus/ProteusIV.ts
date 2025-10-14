import { BleDevice } from '@capacitor-community/bluetooth-le';
import { BLEModuleType } from '../BLEModuleType';
import { GeneralBLEModule } from '../GeneralBLEModule';

export class ProteusIV extends GeneralBLEModule {
	constructor(bledevice: BleDevice) {
		super(bledevice);
	}

	getType(): BLEModuleType {
		return BLEModuleType.ProteusIV;
	}

	getDefaultMTUSize(): number {
		return 23;
	}
}
