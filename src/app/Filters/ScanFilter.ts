import { FilterType } from './FilterType';

export interface ScanFilter {
	getType(): FilterType;
	getTypeString(): string;
	getIsExclusiveFilterType(): boolean;
	hasEquivalentScanFilter(filters: ScanFilter[]): boolean;
}
