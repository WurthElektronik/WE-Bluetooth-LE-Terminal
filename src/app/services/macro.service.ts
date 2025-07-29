import { Preferences } from '@capacitor/preferences';
import { HEX } from '../Encoders/HEX';
import { Injectable } from '@angular/core';
import { Macro } from '../Macro/Macro';
@Injectable({
	providedIn: 'root',
})
export class MacroService {
	private static readonly MACRO_PREFERENCES_KEY: string = 'macros';

	static async getSavedMacros(): Promise<Macro[]> {
		let macroArray: Macro[] = [];

		let macrosJSONString = (
			await Preferences.get({ key: MacroService.MACRO_PREFERENCES_KEY })
		).value;

		if (macrosJSONString == null) {
			return macroArray;
		}

		let macrosJSONStringArray: Macro[] = JSON.parse(
			macrosJSONString,
			MacroService.macroJsonReviver,
		);

		return macrosJSONStringArray;
	}

	static async setSavedMacros(macroArray: Macro[]) {
		await Preferences.set({
			key: MacroService.MACRO_PREFERENCES_KEY,
			value: JSON.stringify(macroArray, MacroService.macroJsonReplacer),
		});
	}

	static macroJsonReplacer(key: string, value: any): any {
		switch (key) {
			case 'macroData':
				return HEX.BufferToEncoding(value.buffer).replace(/ /g, '');
			default:
				return value;
		}
	}

	static macroJsonReviver(key: string, value: any): any {
		switch (key) {
			case 'macroData':
				return new DataView(HEX.EncodingToBuffer(value.replace(/ /g, '')));
			default:
				return value;
		}
	}
}
