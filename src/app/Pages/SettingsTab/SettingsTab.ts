import { Component, OnInit } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DataMode } from 'src/app/BLEProfiles/DataMode';
import { SPPBLECharacteristicType } from 'src/app/BLEProfiles/SPPBLECharacteristicType';
import { SPPBLEProfileClass } from 'src/app/BLEProfiles/SPPBLEProfile';
import { BLE_PROFILES } from 'src/app/BLEProfiles/SPPBLEProfile.registry';
import {
	getSavedSPPBLEUUIDOverrides,
	setSavedSPPBLEUUIDOverrides,
} from 'src/app/BLEProfiles/SPPBLEUUIDOverrides';
import { ChangeLanguageComponent } from 'src/app/Components/change-language/change-language.component';

@Component({
	selector: 'app-settings',
	templateUrl: './SettingsTab.html',
	styleUrls: ['./SettingsTab.scss'],
	standalone: false,
})
export class SettingsTab implements OnInit {
	constructor(
		private modalCtrl: ModalController,
		private translate: TranslateService,
		private fb: FormBuilder,
	) {}

	profileForms = new Map<SPPBLEProfileClass, FormGroup>();

	DataMode = DataMode;
	SPPBLECharacteristicType = SPPBLECharacteristicType;

	readonly BLE_PROFILES = BLE_PROFILES;

	readonly SERVICE_UUID_FORM_CONTROL_NAME: string = 'ServiceUUID';
	readonly RX_UUID_FORM_CONTROL_NAME: string = 'RXUUID';
	readonly TX_UUID_FORM_CONTROL_NAME: string = 'TXUUID';
	readonly RX_ACK_UUID_FORM_CONTROL_NAME: string = 'TXAckUUID';
	readonly TX_ACK_UUID_FORM_CONTROL_NAME: string = 'RXAckUUID';

	async ngOnInit() {
		for (const profile of BLE_PROFILES) {
			let profileFormGroup = this.createProfileForm(profile);
			profileFormGroup.valueChanges.subscribe(() => {
				profileFormGroup.markAllAsTouched();
			});
			this.profileForms.set(profile, profileFormGroup);
		}
	}

	async languageclick() {
		const modal = await this.modalCtrl.create({
			component: ChangeLanguageComponent,
		});
		modal.cssClass = 'auto-height';
		modal.animated = false;
		modal.present();

		const { data, role } = await modal.onWillDismiss();

		if (role === 'confirm') {
			await Preferences.set({
				key: 'preflang',
				value: data,
			});
			this.translate.use(data);
		}
	}

	uuidValidator(control: AbstractControl): ValidationErrors | null {
		const value = control.value?.trim();
		if (!value) return null;

		const valid =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
				value,
			);

		return valid ? null : { invalidUuid: true };
	}
	private uuidControl(
		value: string | null,
		required = true,
	): [string | null, ValidatorFn[]] {
		const validators: ValidatorFn[] = [this.uuidValidator.bind(this)];

		if (required) {
			validators.unshift(Validators.required);
		}

		return [value, validators];
	}

	sharedRxTxGroupValidator(profile: SPPBLEProfileClass): ValidatorFn {
		return (group: AbstractControl): ValidationErrors | null => {
			if (!profile.isSharedRXTXcharacteristic()) {
				return null;
			}

			const rx = group.get(this.RX_UUID_FORM_CONTROL_NAME)?.value;
			const tx = group.get(this.TX_UUID_FORM_CONTROL_NAME)?.value;

			if (rx !== tx) {
				return { rxTxMustMatch: true };
			}

			if (!profile.isAcknowledgedDataModeSupported()) {
				return null;
			}

			const rxAck = group.get(this.RX_ACK_UUID_FORM_CONTROL_NAME)?.value;
			const txAck = group.get(this.TX_ACK_UUID_FORM_CONTROL_NAME)?.value;

			if (rxAck !== txAck) {
				return { rxTxAckMustMatch: true };
			}

			return null;
		};
	}

	profileToFormValue(
		profile: SPPBLEProfileClass,
	): Record<string, string | null> {
		return {
			[this.SERVICE_UUID_FORM_CONTROL_NAME]: profile.getTemplateServiceUUID(),

			[this.RX_UUID_FORM_CONTROL_NAME]:
				profile.getTemplateCharacteristicUUID(
					DataMode.UnacknowledgedData,
					SPPBLECharacteristicType.RX,
				) ?? null,

			[this.TX_UUID_FORM_CONTROL_NAME]:
				profile.getTemplateCharacteristicUUID(
					DataMode.UnacknowledgedData,
					SPPBLECharacteristicType.TX,
				) ?? null,

			[this.RX_ACK_UUID_FORM_CONTROL_NAME]:
				profile.isAcknowledgedDataModeSupported()
					? (profile.getTemplateCharacteristicUUID(
							DataMode.AcknowledgedData,
							SPPBLECharacteristicType.RX,
						) ?? null)
					: null,

			[this.TX_ACK_UUID_FORM_CONTROL_NAME]:
				profile.isAcknowledgedDataModeSupported()
					? (profile.getTemplateCharacteristicUUID(
							DataMode.AcknowledgedData,
							SPPBLECharacteristicType.TX,
						) ?? null)
					: null,
		};
	}

	createProfileForm(profile: SPPBLEProfileClass): FormGroup {
		const values = this.profileToFormValue(profile);

		return this.fb.group(
			{
				[this.SERVICE_UUID_FORM_CONTROL_NAME]: this.uuidControl(
					values[this.SERVICE_UUID_FORM_CONTROL_NAME],
				),

				[this.RX_UUID_FORM_CONTROL_NAME]: this.uuidControl(
					values[this.RX_UUID_FORM_CONTROL_NAME],
				),

				[this.TX_UUID_FORM_CONTROL_NAME]: this.uuidControl(
					values[this.TX_UUID_FORM_CONTROL_NAME],
				),

				[this.RX_ACK_UUID_FORM_CONTROL_NAME]:
					profile.isAcknowledgedDataModeSupported()
						? this.uuidControl(values[this.RX_ACK_UUID_FORM_CONTROL_NAME])
						: this.uuidControl(null, false),

				[this.TX_ACK_UUID_FORM_CONTROL_NAME]:
					profile.isAcknowledgedDataModeSupported()
						? this.uuidControl(values[this.TX_ACK_UUID_FORM_CONTROL_NAME])
						: this.uuidControl(null, false),
			},
			{
				validators: [this.sharedRxTxGroupValidator(profile)],
			},
		);
	}

	async applyProfile(profile: SPPBLEProfileClass) {
		const form = this.profileForms.get(profile);

		if (!form || form.invalid) {
			return;
		}

		const value = form.value;

		profile.setTemplateServiceUUID(value[this.SERVICE_UUID_FORM_CONTROL_NAME]);

		profile.setTemplateCharacteristicUUID(
			DataMode.UnacknowledgedData,
			SPPBLECharacteristicType.RX,
			value[this.RX_UUID_FORM_CONTROL_NAME],
		);

		profile.setTemplateCharacteristicUUID(
			DataMode.UnacknowledgedData,
			SPPBLECharacteristicType.TX,
			value[this.TX_UUID_FORM_CONTROL_NAME],
		);

		if (profile.isAcknowledgedDataModeSupported()) {
			profile.setTemplateCharacteristicUUID(
				DataMode.AcknowledgedData,
				SPPBLECharacteristicType.RX,
				value[this.RX_ACK_UUID_FORM_CONTROL_NAME],
			);

			profile.setTemplateCharacteristicUUID(
				DataMode.AcknowledgedData,
				SPPBLECharacteristicType.TX,
				value[this.TX_ACK_UUID_FORM_CONTROL_NAME],
			);
		}

		await setSavedSPPBLEUUIDOverrides(profile);

		form.patchValue(this.profileToFormValue(profile));
		form.markAsPristine();
	}

	resetUuid(profile: SPPBLEProfileClass, controlName: string) {
		const form = this.profileForms.get(profile);
		if (!form) {
			return;
		}

		var defaultUUID: string;

		switch (controlName) {
			case this.SERVICE_UUID_FORM_CONTROL_NAME: {
				defaultUUID = profile.getDefaultServiceUUID();
				break;
			}
			case this.RX_UUID_FORM_CONTROL_NAME: {
				defaultUUID = profile.getDefaultCharacteristicUUID(
					DataMode.UnacknowledgedData,
					SPPBLECharacteristicType.RX,
				);
				break;
			}
			case this.TX_UUID_FORM_CONTROL_NAME: {
				defaultUUID = profile.getDefaultCharacteristicUUID(
					DataMode.UnacknowledgedData,
					SPPBLECharacteristicType.TX,
				);
				break;
			}
			case this.RX_ACK_UUID_FORM_CONTROL_NAME: {
				defaultUUID = profile.getDefaultCharacteristicUUID(
					DataMode.AcknowledgedData,
					SPPBLECharacteristicType.RX,
				);
				break;
			}
			case this.TX_ACK_UUID_FORM_CONTROL_NAME: {
				defaultUUID = profile.getDefaultCharacteristicUUID(
					DataMode.AcknowledgedData,
					SPPBLECharacteristicType.TX,
				);
				break;
			}
			default:
				return;
		}

		form.get(controlName)?.patchValue(defaultUUID);
	}
}
