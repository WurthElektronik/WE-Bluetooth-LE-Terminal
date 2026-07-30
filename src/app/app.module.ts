import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Globalization } from '@awesome-cordova-plugins/globalization/ngx';
import {
	ServiceWorkerModule,
	SwRegistrationOptions,
} from '@angular/service-worker';
import { Platform } from '@ionic/angular';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		IonicModule.forRoot({ mode: 'md' }),
		AppRoutingModule,
		FormsModule,
		HttpClientModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [HttpClient],
			},
		}),
		ServiceWorkerModule.register('ngsw-worker.js'),
	],
	providers: [
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		Globalization,
		{
			provide: SwRegistrationOptions,
			useFactory: (platform: Platform) => ({
				enabled: !isDevMode() && !platform.is('electron'),
				registrationStrategy: 'registerWhenStable:30000',
			}),
			deps: [Platform],
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
