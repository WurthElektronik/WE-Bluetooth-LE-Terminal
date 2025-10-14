import { FilterType } from './FilterType';
import { ScanFilter } from './ScanFilter';
import { Pipe, PipeTransform } from '@angular/core';

export class RSSIFilter implements ScanFilter {
	private RSSIValue: number;

	constructor(RSSIValue: number) {
		this.RSSIValue = RSSIValue;
	}

	public getType(): FilterType {
		return FilterType.RSSI;
	}

	public getTypeString(): string {
		return FilterType[FilterType.RSSI];
	}

	public getRSSIValue(): number {
		return this.RSSIValue;
	}

	public getIsExclusiveFilterType(): boolean {
		return true;
	}

	hasEquivalentScanFilter(filters: ScanFilter[]): boolean {
		throw new Error('not implemented.');
	}
}

@Pipe({
    name: 'RSSIFilterPipe',
    pure: true,
    standalone: false
})
export class RSSIFilterPipe implements PipeTransform {
	transform(value: ScanFilter): RSSIFilter {
		return value.getType() == FilterType.RSSI
			? (value as RSSIFilter)
			: undefined;
	}
}
