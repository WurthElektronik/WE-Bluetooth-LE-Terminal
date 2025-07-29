import { BleService } from '@capacitor-community/bluetooth-le';

export abstract class GeneralBLEProfile {
	abstract getService(): BleService;
}
