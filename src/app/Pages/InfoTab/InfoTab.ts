import { Component } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ChangeLanguageComponent } from 'src/app/Components/change-language/change-language.component';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-info',
  templateUrl: 'InfoTab.html',
  styleUrls: ['InfoTab.scss']
})
export class InfoTab {

  public version:string = environment.appVersion;

  constructor(private router: Router, private modalCtrl: ModalController, private translate: TranslateService) {}

  async wirelesssensorsclick(){
    await Browser.open({ url: 'https://www.we-online.com/en/products/components/service/wireless-connectivity-sensors' });
  }

  async usermanualsclick(){
    await Browser.open({ url: 'https://www.we-online.com/en/products/components/service/wireless-connectivity-sensors?#i2345' });

  }

  async sourcecodeclick(){
    await Browser.open({ url: 'https://github.com/WurthElektronik' });
  }

  policyclick(){
    this.router.navigate(
      ['/policy']
    );
  }

  imprintclick(){
    this.router.navigate(
      ['/imprint']
    );
  }

  whatsnew(){
    this.router.navigate(
      ['/whatsnew']
    );
  }
  
  async languageclick(){
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

}
