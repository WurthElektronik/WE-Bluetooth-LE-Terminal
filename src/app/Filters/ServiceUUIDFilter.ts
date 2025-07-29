import { SPPBLEProfileType } from '../BLEProfiles/SPPBLEProfileType';
import { FilterType } from './FilterType';
import { ScanFilter } from './ScanFilter';
import { Pipe, PipeTransform } from '@angular/core';
import { SPPBLEProfile } from '../BLEProfiles/SPPBLEProfile';

export class ServiceUUIDFilter implements ScanFilter {
	private profile: SPPBLEProfile;

	constructor(profile: SPPBLEProfile) {
		this.profile = profile;
	}

	public getType(): FilterType {
		return FilterType.ServiceUUID;
	}

	public getTypeString(): string {
		return FilterType[FilterType.ServiceUUID];
	}

	public getServiceUUID(): string {
		return this.profile.getService().uuid;
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
})
export class ServiceUUIDFilterPipe implements PipeTransform {
	transform(value: ScanFilter): ServiceUUIDFilter {
		return value.getType() == FilterType.ServiceUUID
			? (value as ServiceUUIDFilter)
			: undefined;
	}
}
