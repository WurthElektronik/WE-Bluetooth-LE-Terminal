import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BLEProfileType } from 'src/app/BLEProfiles/BLEProfileType';
import { CYSPPProfile } from 'src/app/BLEProfiles/CYSPPProfile';
import { WESPPProfile } from 'src/app/BLEProfiles/WESPPProfile';
import { FilterType } from 'src/app/Filters/FilterType';
import { NameFilter } from 'src/app/Filters/NameFilter';
import { ScanFilter } from 'src/app/Filters/ScanFilter';
import { ServiceUUIDFilter } from 'src/app/Filters/ServiceUUIDFilter';

@Component({
  selector: 'app-add-filter',
  templateUrl: './add-filter.component.html',
  styleUrls: ['./add-filter.component.scss'],
})
export class AddFilterComponent implements OnInit {

  public filters = Object.keys(FilterType).map(key => FilterType[key]).filter(value => typeof value === 'string') as string[];
  public selectedFilter:FilterType = FilterType.Name;
  public name:string = "";
  public serviceUUIDs = Object.keys(BLEProfileType).map(key => BLEProfileType[key]).filter(value => typeof value === 'string') as string[];
  public selectedserviceUUID:string = BLEProfileType[BLEProfileType.WESPP];
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  addfilter(){
    var filter:ScanFilter;
    switch(this.selectedFilter){
      case FilterType.Name:
        filter = new NameFilter(this.name);
        break;
      case FilterType.ServiceUUID:
        switch(BLEProfileType[this.selectedserviceUUID])
        {
          default:
          case BLEProfileType.WESPP:
            filter = new ServiceUUIDFilter(WESPPProfile);
            break;
          case BLEProfileType.CYSPP:
            filter = new ServiceUUIDFilter(CYSPPProfile);
            break;
        }
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
