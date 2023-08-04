import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TerminalTab } from './TerminalTab';
import {  HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
import { TerminalRoutingModule } from './Terminal-routing.module';
import { SelectEncodingComponent } from 'src/app/Components/select-encoding/select-encoding.component';
import { ConfigGpioComponent } from 'src/app/Components/config-gpio/config-gpio.component';
import { RwGpioComponent } from 'src/app/Components/rw-gpio/rw-gpio.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TerminalRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [TerminalTab,SelectEncodingComponent,ConfigGpioComponent,RwGpioComponent]
})
export class  TerminalTabModule {}
