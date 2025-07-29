import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ToastOptions } from '@ionic/core';
@Injectable({
	providedIn: 'root',
})
export class ToastService {
	private toast: HTMLIonToastElement = null;

	constructor(private toastController: ToastController) {}

	async showToast(
		text: string,
		duration: number,
		position?: ToastOptions['position'],
	): Promise<void> {
		this.toast ? this.toast.dismiss() : false;
		this.toast = await this.toastController.create({
			message: text,
			duration: duration,
			position: position,
			cssClass: 'toastwidth',
		});
		this.toast.present();
	}
}
