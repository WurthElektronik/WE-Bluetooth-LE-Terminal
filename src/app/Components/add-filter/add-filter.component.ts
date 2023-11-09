import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FilterType } from 'src/app/Filters/FilterType';
import { NameFilter } from 'src/app/Filters/NameFilter';
import { ScanFilter } from 'src/app/Filters/ScanFilter';
import { ServiceUUIDFilter } from 'src/app/Filters/ServiceUUIDFilter';
import { PROTEUS_BLE_SERVICE } from 'src/app/services/ble.service';

@Component({
  selector: 'app-add-filter',
  templateUrl: './add-filter.component.html',
  styleUrls: ['./add-filter.component.scss'],
})
export class AddFilterComponent implements OnInit {

  public filters = Object.keys(FilterType).map(key => FilterType[key]).filter(value => typeof value === 'string') as string[];
  public selectedFilter:FilterType = FilterType.Name;
  public name:string = "";
  public PROTEUS_BLE_SERVICE = PROTEUS_BLE_SERVICE;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  addfilter(){
    var filter:ScanFilter;
    switch(this.selectedFilter){
      case FilterType.Name:
        filter = new NameFilter(this.name);
        break;
      case FilterType.ServiceUUID:
        filter = new ServiceUUIDFilter(PROTEUS_BLE_SERVICE);
        break;
      default:
        return this.modalCtrl.dismiss(undefined, 'cancel');
    }
    return this.modalCtrl.dismiss(filter, 'confirm');
  }

  filterChanged(event){
    this.selectedFilter = FilterType[event.detail.value as string];
  }

  onNameInput(event){
    this.name = event.detail.value;
  }

}
