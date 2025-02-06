import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BLEModuleType } from 'src/app/BLEModules/BLEModuleType';
import { module_profile } from 'src/app/BLEModules/ModuleProfile';
import { DataMode } from 'src/app/BLEProfiles/DataMode';

@Component({
  selector: 'app-select-module',
  templateUrl: './select-module.component.html',
  styleUrls: ['./select-module.component.scss'],
})
export class SelectModuleComponent implements OnInit {

  public selectedmodule:string = BLEModuleType[BLEModuleType.ProteusIII];
  BLEModuleType = BLEModuleType;
  public modules_profile = module_profile;
  public dataModes = Object.keys(DataMode).map(key => DataMode[key]).filter(value => typeof value === 'string') as string[];
  public selectedDataMode:string = DataMode[DataMode.UnacknowledgedData];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  choosemodule(){
    return this.modalCtrl.dismiss({selectedmodule: BLEModuleType[this.selectedmodule], selectedDataMode: DataMode[this.selectedDataMode]}, 'confirm');
  }

}
