import { Component, OnInit } from '@angular/core';
import { Globalization } from '@awesome-cordova-plugins/globalization/ngx';
import { Preferences } from '@capacitor/preferences';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-language',
  templateUrl: './change-language.component.html',
  styleUrls: ['./change-language.component.scss'],
})
export class ChangeLanguageComponent implements OnInit {
  public selectedlang:string = undefined;
  constructor(private globalization: Globalization, private translate: TranslateService,private modalCtrl: ModalController) { }

  async ionViewWillEnter(){
    let preflanguage =  await Preferences.get({ key: 'preflang' });
    if(preflanguage.value == null){
      this.globalization.getPreferredLanguage()
      .then(res => {
        this.selectedlang = res.value.split("-")[0];
      })
      .catch(e => {
        this.selectedlang = this.translate.defaultLang;
      });
    }else{
      this.selectedlang = preflanguage.value;
    }
  }

  ngOnInit() {}

  langselected(lang:string){
    return this.modalCtrl.dismiss(lang, 'confirm');
  }

}
