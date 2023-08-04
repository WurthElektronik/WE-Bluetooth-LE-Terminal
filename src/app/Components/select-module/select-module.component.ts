import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BLEModuleType } from 'src/app/BLEModules/BLEModuleType';

@Component({
  selector: 'app-select-module',
  templateUrl: './select-module.component.html',
  styleUrls: ['./select-module.component.scss'],
})
export class SelectModuleComponent implements OnInit {

  public selectedmodule:string = BLEModuleType[BLEModuleType.ProteusIII];
  public modules = Object.keys(BLEModuleType).map(key => BLEModuleType[key]).filter(value => typeof value === 'string') as string[];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  choosemodule(){
    return this.modalCtrl.dismiss(BLEModuleType[this.selectedmodule], 'confirm');
  }

}
