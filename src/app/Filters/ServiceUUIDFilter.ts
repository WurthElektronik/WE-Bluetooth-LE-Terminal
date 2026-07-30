import { SPPBLEProfileType } from '../BLEProfiles/SPPBLEProfileType';
import { FilterType } from './FilterType';
import { ScanFilter } from './ScanFilter';
import { Pipe, PipeTransform } from '@angular/core';
import { SPPBLEProfileClass } from '../BLEProfiles/SPPBLEProfile';

export class ServiceUUIDFilter implements ScanFilter {
	private profile: SPPBLEProfileClass;

	constructor(profile: SPPBLEProfileClass) {
		this.profile = profile;
	}

	public getType(): FilterType {
		return FilterType.ServiceUUID;
	}

	public getTypeString(): string {
		return FilterType[FilterType.ServiceUUID];
	}

	public getServiceUUID(): string {
		return this.profile.getTemplateServiceUUID();
	}

	public getServiceName(): string {
		return SPPBLEProfileType[this.profile.getType()];
	}

	public getIsExclusiveFilterType(): boolean {
		return false;
	}

	hasEquivalentScanFilter(filters: ScanFilter[]): boolean {
		let ServiceUUIDsfilters: ServiceUUIDFilter[] =
			filters as ServiceUUIDFilter[];

		return ServiceUUIDsfilters.some(
			(filter) => filter.getServiceUUID() === this.getServiceUUID(),
		);
	}
}

@Pipe({
	name: 'ServiceUUIDFilterPipe',
	pure: true,
	standalone: false,
})
export class ServiceUUIDFilterPipe implements PipeTransform {
	transform(value: ScanFilter): ServiceUUIDFilter {
		return value.getType() == FilterType.ServiceUUID
			? (value as ServiceUUIDFilter)
			: undefined;
	}
}
