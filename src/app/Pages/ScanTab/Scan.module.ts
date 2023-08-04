import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScanTab } from './ScanTab';
import {  HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
import { ScanTabRoutingModule } from './Scan-routing.module';
import { SelectModuleComponent } from 'src/app/Components/select-module/select-module.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ScanTabRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [ScanTab,SelectModuleComponent]
})
export class ScanTabModule {}
