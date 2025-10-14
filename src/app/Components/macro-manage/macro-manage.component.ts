import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import {
	IonInput,
	IonList,
	ItemReorderEventDetail,
	Platform,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Encoder } from 'src/app/Encoders/Encoder';
import { EncodingType } from 'src/app/Encoders/EncodingType';
import { File } from 'src/app/File/File';
import { ASCII } from 'src/app/Encoders/ASCII';
import { ToastService } from 'src/app/services/toast.service';
import { Macro } from 'src/app/Macro/Macro';
import { MacroService } from 'src/app/services/macro.service';

@Component({
    selector: 'app-macro-manage',
    templateUrl: './macro-manage.component.html',
    styleUrls: ['./macro-manage.component.scss'],
    standalone: false
})
export class MacroManageComponent implements OnInit {
	public macroName: string = '';
	public macroData: string = '';
	public macroArray: Macro[] = [];
	public selectedencoding: Encoder;
	public editedMacro: Macro = undefined;
	@ViewChild('macroNameInput') macroNameInput: IonInput;
	@ViewChild('macroDataInput') macroDataInput: IonInput;
	@ViewChild('macroList') macroList: IonList;
	@ViewChild('exportWebLink', { read: ElementRef }) exportWebLink: ElementRef;

	private readonly MACRO_CONFIG_EXPORT_NAME: string = 'macro_config.json';
	private readonly MACRO_CONFIG_EXPORT_INDENT: number = 4;

	constructor(
		private toastService: ToastService,
		private translateService: TranslateService,
		public platform: Platform,
	) {}

	async ngOnInit() {
		this.macroArray = await MacroService.getSavedMacros();
		if (this.platform.is('desktop')) {
			this.exportWebLink.nativeElement.setAttribute(
				'download',
				this.MACRO_CONFIG_EXPORT_NAME,
			);
		}
	}

	async handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
		this.macroArray = ev.detail.complete(this.macroArray);
		await MacroService.setSavedMacros(this.macroArray);
	}

	async addMacro() {
		try {
			if (!this.macroName || this.macroName.length == 0) {
				this.macroNameInput.setFocus();
				return;
			}

			if (!this.macroData || this.macroData.length == 0) {
				this.macroDataInput.setFocus();
				return;
			}

			if (!this.selectedencoding.CheckEncoding(this.macroData)) {
				throw new Error(
					`ParserMessages.${EncodingType[this.selectedencoding.getEncodingType()]}Error`,
				);
			}

			if (this.editedMacro != undefined) {
				this.macroArray[this.macroArray.indexOf(this.editedMacro)] = {
					macroName: this.macroName,
					macroData: new DataView(
						this.selectedencoding.EncodingToBuffer(this.macroData),
					),
				};
			} else {
				this.macroArray.push({
					macroName: this.macroName,
					macroData: new DataView(
						this.selectedencoding.EncodingToBuffer(this.macroData),
					),
				});
			}

			this.macroName = '';
			this.macroNameInput.value = '';

			this.macroData = '';
			this.macroDataInput.value = '';

			await MacroService.setSavedMacros(this.macroArray);
		} catch (error) {
			this.translateService
				.get(error.message)
				.subscribe(async (res: string) => {
					this.toastService.showToast(res, 500, 'bottom');
				});
		}
	}

	async deleteMacro(macro: Macro) {
		this.macroArray.splice(this.macroArray.indexOf(macro), 1);
		await MacroService.setSavedMacros(this.macroArray);
	}

	async editMacro(macro: Macro) {
		this.editedMacro = macro;

		if (macro == undefined) {
			return;
		}

		this.macroName = macro.macroName;
		this.macroNameInput.value = macro.macroName;

		this.macroData = this.selectedencoding.BufferToEncoding(
			macro.macroData.buffer,
		);
		this.macroDataInput.value = this.selectedencoding.BufferToEncoding(
			macro.macroData.buffer,
		);
		await this.macroList.closeSlidingItems();
	}

	async onMacroNameInput(event) {
		this.macroName = event.detail.value;
		await this.editMacro(
			this.macroArray.find((e) => e.macroName === this.macroName),
		);
	}

	onMacroDataInput(event) {
		let value: string = event.detail.value;
		var filteredValue: string = value;
		filteredValue = this.selectedencoding.InputFilterEncoding(value);
		this.macroDataInput.value = filteredValue;
	}

	updateMacroData(event) {
		this.macroData = event.detail.value;
	}

	cancelEditMacro() {
		this.editedMacro = undefined;

		this.macroName = '';
		this.macroNameInput.value = '';

		this.macroData = '';
		this.macroDataInput.value = '';
	}

	async exportMacros() {
		if (this.platform.is('desktop')) {
			this.exportWebLink.nativeElement.setAttribute(
				'href',
				window.URL.createObjectURL(
					new Blob(
						[
							JSON.stringify(
								await MacroService.getSavedMacros(),
								MacroService.macroJsonReplacer,
								this.MACRO_CONFIG_EXPORT_INDENT,
							),
						],
						{ type: 'text/plain' },
					),
				),
			);
			this.exportWebLink.nativeElement.click();
		} else {
			var message: string = '';
			var filepathURI = ';';
			try {
				let filepath = await Filesystem.writeFile({
					path: this.MACRO_CONFIG_EXPORT_NAME,
					data: JSON.stringify(
						await MacroService.getSavedMacros(),
						MacroService.macroJsonReplacer,
						this.MACRO_CONFIG_EXPORT_INDENT,
					),
					directory: Directory.Documents,
					encoding: Encoding.UTF8,
				});
				filepathURI = filepath.uri;
				message = 'exportsuccess';
			} catch (error) {
				message = 'exportfail';
			} finally {
				this.translateService
					.get('MacroManage.' + message, { filepath: filepathURI })
					.subscribe(async (res: string) => {
						this.toastService.showToast(res, 1500, 'bottom');
					});
			}
		}
	}

	async importMacros() {
		try {
			const result = await FilePicker.pickFiles({
				limit: 1,
				readData: true,
				types: ['application/json'],
			});
			let data: ArrayBuffer = await File.parseDataBase64toBuffer(
				result.files[0].data,
			);
			await MacroService.setSavedMacros(
				JSON.parse(ASCII.BufferToEncoding(data), MacroService.macroJsonReviver),
			);
			this.macroArray = await MacroService.getSavedMacros();
		} catch (error) {
			await MacroService.setSavedMacros([]);
			this.translateService
				.get('MacroManage.importfail')
				.subscribe(async (res: string) => {
					this.toastService.showToast(res, 1500, 'bottom');
				});
		}
	}
}
