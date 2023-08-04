import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoTab } from './InfoTab';
import {  HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
import { InfoRoutingModule } from './Info-routing.module';
import { ChangeLanguageComponent } from 'src/app/Components/change-language/change-language.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    InfoRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [InfoTab,ChangeLanguageComponent]
})
export class InfoModule {}
