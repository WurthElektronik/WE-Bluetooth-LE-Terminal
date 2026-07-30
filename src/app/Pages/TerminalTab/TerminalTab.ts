import { Component, NgZone, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
	IonContent,
	IonInput,
	IonSelect,
	ModalController,
	Platform,
	ToastController,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { buffer, Subscription } from 'rxjs';
import { BleService } from '../../services/ble.service';
import { LogMessageType } from 'src/app/Logger/LogMessageType';
import { SelectEncodingComponent } from 'src/app/Components/select-encoding/select-encoding.component';
import { EncodingType } from 'src/app/Encoders/EncodingType';
import { environment } from '../../../environments/environment';
import { testdevice } from 'src/app/TestDevice/TestBLEDevice';
import { ConfigGpioComponent } from 'src/app/Components/config-gpio/config-gpio.component';
import { ConnectionPriority } from '@capacitor-community/bluetooth-le';
import { RwGpioComponent } from 'src/app/Components/rw-gpio/rw-gpio.component';
import { Encoder } from 'src/app/Encoders/Encoder';
import { ASCII } from 'src/app/Encoders/ASCII';
import { HEX } from 'src/app/Encoders/HEX';
import { MacroManageComponent } from 'src/app/Components/macro-manage/macro-manage.component';
import { ToastService } from 'src/app/services/toast.service';
import { Macro } from 'src/app/Macro/Macro';
import { MacroService } from 'src/app/services/macro.service';
import { GeneralBLEModule } from 'src/app/BLEModules/GeneralBLEModule';

@Component({
	selector: 'app-terminal',
	templateUrl: 'TerminalTab.html',
	styleUrls: ['TerminalTab.scss'],
	standalone: false,
})
export class TerminalTab {
	id: string = null;
	private disconnectsubscription: Subscription;
	private msgloggedsubscription: Subscription;
	@ViewChild('terminalpopover') terminalpopover;
	public terminalpopoveropen: Boolean = false;
	public msgfilterskeys = Object.keys(LogMessageType)
		.map((key) => LogMessageType[key])
		.filter((value) => typeof value === 'string') as string[];
	public msgfilters = LogMessageType;
	public selectedfilters: string[] = ['Info', 'Data', 'RemoteCommand'];
	public selectedfiltersenum: LogMessageType[] = [];
	@ViewChild('devicepopover') devicepopover;
	@ViewChild('requestconnectionpopover') requestconnectionpopover;
	public devicepopoveropen: Boolean = false;
	public connectionprioritypopoveropen: Boolean = false;
	@ViewChild('ioncontent') content: IonContent;
	public autoscroll: Boolean = true;
	public payload: string = undefined;
	public selectedencoding: Encoder = ASCII;
	public randompayload: Boolean = false;
	public sendtoall: Boolean = false;
	public multiplepackets: Boolean = false;
	@ViewChild('filterselect') filterselect: IonSelect;
	@ViewChild('payloadinput') payloadinput: IonInput;
	@ViewChild('sendcountinput') sendcountinput: IonInput;
	@ViewChild('txintervalinput') txintervalinput: IonInput;
	@ViewChild('randompayloadlengthinput') randompayloadlengthinput: IonInput;

	public payloadCount: number = 0;
	public sendCount: number = 1;
	public txInterval: number = 1000;
	public randomPayloadLength: number = 20;

	public HEX = HEX;

	ConnectionPriority = ConnectionPriority;
	LogMessageType = LogMessageType;

	public macros: Macro[] = [];

	constructor(
		private route: ActivatedRoute,
		public platform: Platform,
		private router: Router,
		public ble: BleService,
		private ngZone: NgZone,
		private modalCtrl: ModalController,
		private toastService: ToastService,
		private translateService: TranslateService,
	) {}

	async ngOnInit() {
		this.platform.keyboardDidShow.subscribe((ev) => {
			this.scrollToBottom();
		});
		this.platform.keyboardDidHide.subscribe((ev) => {
			this.scrollToBottom();
		});
		this.translateService.onLangChange.subscribe(() => {
			let filterkeys: string[] = [];
			for (let filter of this.selectedfilters) {
				filterkeys.push('TerminalTab.filters.' + filter);
			}
			this.translateService.get(filterkeys).subscribe(async (res) => {
				if (this.filterselect != undefined) {
					this.filterselect.selectedText = '';
					for (let item in res) {
						this.filterselect.selectedText += `${res[item]}, `;
					}
					this.filterselect.selectedText = this.filterselect.selectedText.slice(
						0,
						-2,
					);
				}
			});
		});

		this.macros = await MacroService.getSavedMacros();

		this.route.queryParamMap.subscribe(async (params) => {
			let deviceid = params.get('deviceid');
			if (deviceid != undefined && this.ble.connectedDevices.has(deviceid)) {
				this.id = deviceid;
				if (this.msgloggedsubscription) {
					this.msgloggedsubscription.unsubscribe();
				}
				this.msgloggedsubscription = this.ble.connectedDevices
					.get(this.id)
					.getLoggerDataLoggedSubject()
					.subscribe(async () => {
						this.ngZone.run(() => {
							this.scrollToBottom();
						}); // needed to make sure changes are reflected in the UI
					});
				this.scrollToBottom();
			}
		});
	}

	ionViewWillEnter() {
		this.disconnectsubscription = this.ble.onDeviceDisconnected.subscribe(
			async (disconnecteddeviceid: string) => {
				if (this.ble.connectedDevices.size == 0) {
					this.selectedfilters = ['Info', 'Data', 'RemoteCommand'];
					this.selectedfiltersenum = [];
					this.sendCount = 1;
					this.txInterval = 1000;
					this.router.navigate(['/tabs/scan']);
				} else {
					let sorteddeviceidsarray = Array.from(
						new Map(
							[...this.ble.connectedDevices.entries()].sort((a, b) =>
								a[0].localeCompare(b[0]),
							),
						).keys(),
					);
					let nextdeviceid = sorteddeviceidsarray.findIndex(
						(e) => e.localeCompare(disconnecteddeviceid) > 0,
					);
					if (nextdeviceid == -1) {
						this.router.navigate([], {
							queryParams: {
								deviceid: sorteddeviceidsarray[sorteddeviceidsarray.length - 1],
							},
							queryParamsHandling: 'merge',
						});
					} else {
						this.router.navigate([], {
							queryParams: {
								deviceid: sorteddeviceidsarray[nextdeviceid],
							},
							queryParamsHandling: 'merge',
						});
					}
				}
			},
		);
	}

	ionViewWillLeave() {
		if (this.msgloggedsubscription) {
			this.msgloggedsubscription.unsubscribe();
			this.msgloggedsubscription = undefined;
		}

		this.disconnectsubscription.unsubscribe();
		this.disconnectsubscription = undefined;
	}

	async disconnectclick() {
		if (!environment.production && this.id == testdevice.deviceId) {
			this.ble.connectedDevices.delete(this.id);
			this.ble.onDeviceDisconnected.next(this.id);
		} else {
			await this.ble.disconnect(this.id);
		}
	}

	segmentClicked(deviceid: string) {
		this.router.navigate([], {
			queryParams: {
				deviceid: deviceid,
			},
			queryParamsHandling: 'merge',
		});
	}

	terminalpopoverclick(e: Event) {
		this.terminalpopover.event = e;
		this.terminalpopoveropen = true;
	}

	devicepopoverclick(e: Event) {
		this.devicepopover.event = e;
		this.requestconnectionpopover.event = e;
		this.devicepopoveropen = true;
	}

	connectionprioritypopoverclick() {
		this.connectionprioritypopoveropen = true;
	}

	updatepayload(event) {
		this.payload = event.detail.value;
	}

	async sendclick() {
		try {
			var datatosend: DataView;

			if (this.randompayload) {
				const buffer = new ArrayBuffer(this.randomPayloadLength);
				datatosend = new DataView(buffer);

				for (let i = 0; i < datatosend.byteLength; i++) {
					datatosend.setUint8(i, Math.floor(Math.random() * 256));
				}
			} else {
				this.payloadinput.setFocus();

				if (!this.payload || this.payload.length == 0) {
					return;
				}

				if (!this.selectedencoding.CheckEncoding(this.payload)) {
					throw new Error(
						`ParserMessages.${EncodingType[this.selectedencoding.getEncodingType()]}Error`,
					);
				}

				datatosend = new DataView(
					this.selectedencoding.EncodingToBuffer(this.payload),
				);

				this.payload = '';
				this.payloadinput.value = '';
				this.payloadCounter();
			}

			try {
				await this.ble.senddata(
					this.sendtoall ? undefined : this.id,
					datatosend,
					this.multiplepackets ? this.sendCount : 1,
					this.multiplepackets ? this.txInterval : 0,
				);
			} catch (error) {
				console.log(error);
			}

			this.scrollToBottom();
		} catch (error) {
			this.translateService
				.get(error.message)
				.subscribe(async (res: string) => {
					this.toastService.showToast(res, 500, 'bottom');
				});
		}
	}

	async filterTypeChanged(event) {
		let selectedfiltersstrings: string[] = event.detail.value;

		this.filterselect.selectedText = undefined;

		this.selectedfiltersenum = [];

		for (let filter of selectedfiltersstrings) {
			switch (filter) {
				case 'Info': {
					this.selectedfiltersenum.push(LogMessageType.Info);
					break;
				}
				case 'Data': {
					this.selectedfiltersenum.push(
						LogMessageType.DataSent,
						LogMessageType.DataReceived,
					);
					break;
				}
				case 'RemoteCommand': {
					this.selectedfiltersenum.push(LogMessageType.RemoteCommand);
					break;
				}
			}
		}

		this.scrollToBottom();
	}

	onSendCountInput(event) {
		let value: string = event.detail.value;
		let filteredValue: string = value.replace(/[^0-9]+/g, '');
		this.sendcountinput.value = filteredValue;
	}

	onSendCountChange(event) {
		let value: number = +event.detail.value;
		this.sendcountinput.value = this.sendCount = value <= 1 ? 1 : value;
	}

	onTXIntervalInput(event) {
		let value: string = event.detail.value;
		let filteredValue: string = value.replace(/[^0-9]+/g, '');
		this.txintervalinput.value = filteredValue;
	}

	onTXIntervalChange(event) {
		let value: number = +event.detail.value;
		this.txintervalinput.value = this.txInterval = value <= 50 ? 50 : value;
	}

	onRandomPayloadInput(event) {
		let value: string = event.detail.value;
		let filteredValue: string = value.replace(/[^0-9]+/g, '');
		this.randompayloadlengthinput.value = filteredValue;
	}

	onRandomPayloadChange(event) {
		let value: number = +event.detail.value;
		this.randompayloadlengthinput.value = this.randomPayloadLength =
			value <= 1 ? 1 : value;
	}

	onPayloadInput(event) {
		let value: string = event.detail.value;
		var filteredValue: string = value;
		filteredValue = this.selectedencoding.InputFilterEncoding(value);
		this.payloadinput.value = filteredValue;
		this.payloadCounter();
	}

	payloadCounter() {
		switch (this.selectedencoding.getEncodingType()) {
			default:
			case EncodingType.ASCII:
				this.payloadCount = (this.payloadinput.value as string).length;
				break;
			case EncodingType.HEX:
				this.payloadCount = Math.floor(
					(this.payloadinput.value as string).replace(/ /g, '').length / 2,
				);
				break;
		}
	}

	getmsgclass(msg): string {
		switch (msg.getType()) {
			case LogMessageType.Info:
				return 'infomsg';
			case LogMessageType.DataSent:
				return 'datasentmsg';
			case LogMessageType.DataReceived:
				return 'datareceivedmsg';
			case LogMessageType.RemoteCommand:
				return 'remotecommandmsg';
			default:
				return '';
		}
	}

	async selectencodingclicked() {
		const modal = await this.modalCtrl.create({
			component: SelectEncodingComponent,
			componentProps: {
				selectedencoding: this.selectedencoding,
			},
		});
		modal.cssClass = 'auto-height';
		modal.animated = false;
		modal.present();

		const { data, role } = await modal.onWillDismiss();

		if (role === 'confirm') {
			this.payload = undefined;
			this.selectedencoding = data['selectedencoding'];
		}
	}

	async clearselectedlogs() {
		let module: GeneralBLEModule = this.ble.connectedDevices.get(this.id);
		module.clearLogMessages(this.selectedfiltersenum);
	}

	async configgpioclicked() {
		const modal = await this.modalCtrl.create({
			component: ConfigGpioComponent,
			componentProps: {
				id: this.id,
			},
		});
		modal.cssClass = 'auto-height';
		modal.animated = false;
		modal.backdropDismiss = false;
		modal.present();

		await modal.onWillDismiss();
	}

	async rwgpioclicked() {
		const modal = await this.modalCtrl.create({
			component: RwGpioComponent,
			componentProps: {
				id: this.id,
			},
		});
		modal.cssClass = 'auto-height';
		modal.animated = false;
		modal.backdropDismiss = false;
		modal.present();

		await modal.onWillDismiss();
	}

	async readrssi() {
		await this.ble.readrssi(this.id);
	}

	async readmtu() {
		await this.ble.readmtu(this.id);
	}

	async requestconnectionpriority(priority: string) {
		await this.ble.requestpriority(this.id, ConnectionPriority[priority]);
	}

	async macroclick(macro: Macro) {
		try {
			await this.ble.senddata(
				this.sendtoall ? undefined : this.id,
				macro.macroData,
				this.multiplepackets ? this.sendCount : 1,
				this.multiplepackets ? this.txInterval : 0,
			);
		} catch (error) {
			console.log(error);
		}
	}

	async manageMacrosClicked() {
		const modal = await this.modalCtrl.create({
			component: MacroManageComponent,
			componentProps: {
				selectedencoding: this.selectedencoding,
			},
		});
		modal.cssClass = 'auto-height';
		modal.animated = false;
		modal.present();

		await modal.onWillDismiss();

		this.macros = await MacroService.getSavedMacros();
	}

	scrollToBottom() {
		if (!this.autoscroll) {
			return;
		}

		requestAnimationFrame(() => {
			this.content.scrollToBottom(0);
		});
	}
}
