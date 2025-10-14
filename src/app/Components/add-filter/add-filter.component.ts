import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { SPPBLEProfileType } from 'src/app/BLEProfiles/SPPBLEProfileType';
import { CYSPPProfile } from 'src/app/BLEProfiles/CYSPPProfile';
import { WESPPProfile } from 'src/app/BLEProfiles/WESPPProfile';
import { FilterType } from 'src/app/Filters/FilterType';
import { NameFilter } from 'src/app/Filters/NameFilter';
import { ScanFilter } from 'src/app/Filters/ScanFilter';
import { ServiceUUIDFilter } from 'src/app/Filters/ServiceUUIDFilter';
import { RSSIFilter } from 'src/app/Filters/RSSIFilter';
import { WESPP2Profile } from 'src/app/BLEProfiles/WESPP2Profile';

@Component({
	selector: 'app-add-filter',
	templateUrl: './add-filter.component.html',
	styleUrls: ['./add-filter.component.scss'],
	standalone: false,
})
export class AddFilterComponent implements OnInit {
	public filters = Object.keys(FilterType)
		.map((key) => FilterType[key])
		.filter((value) => typeof value === 'string') as string[];
	public selectedFilter: FilterType = FilterType.Name;
	public name: string = '';
	public serviceUUIDs = Object.keys(SPPBLEProfileType)
		.map((key) => SPPBLEProfileType[key])
		.filter((value) => typeof value === 'string') as string[];

	public selectedServiceUUIDs: { [key: string]: boolean } = {};
	public rssi: number = -65;

	constructor(
		private modalCtrl: ModalController,
		public platform: Platform,
	) {}

	ngOnInit() {}

	addfilter() {
		var filters: ScanFilter[] = [];
		switch (this.selectedFilter) {
			case FilterType.Name:
				filters.push(new NameFilter(this.name));
				break;
			case FilterType.ServiceUUID:
				Object.keys(this.selectedServiceUUIDs)
					.filter((key) => this.selectedServiceUUIDs[key])
					.forEach((filter) => {
						switch (SPPBLEProfileType[filter]) {
							default:
							case SPPBLEProfileType.WESPP:
								filters.push(new ServiceUUIDFilter(WESPPProfile));
								break;
							case SPPBLEProfileType.WESPP2:
								filters.push(new ServiceUUIDFilter(WESPP2Profile));
								break;
							case SPPBLEProfileType.CYSPP:
								filters.push(new ServiceUUIDFilter(CYSPPProfile));
								break;
						}
					});
				break;
			case FilterType.RSSI:
				filters.push(new RSSIFilter(this.rssi));
				break;
			default:
				return this.modalCtrl.dismiss(undefined, 'cancel');
		}
		return this.modalCtrl.dismiss(filters, 'confirm');
	}

	filterChanged(event) {
		this.selectedFilter = FilterType[event.detail.value as string];
	}

	onNameInput(event) {
		this.name = event.detail.value;
	}
}
