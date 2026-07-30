import { TxLogEntry } from 'src/app/services/ble.service';
import { GPIO } from './GPIO';
import { GPIOPin } from './GPIOPin';

export interface GPIOInterface {
	getGPIO(): GPIO;
	formatreadpinconfiguration(): TxLogEntry;
	formatwritepinconfiguration(pins: GPIOPin[]): TxLogEntry;
	formatreadpinvalues(pins: GPIOPin[]): TxLogEntry;
	formatwritepinvalues(pins: GPIOPin[]): TxLogEntry;
}
