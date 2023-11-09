import { FilterType } from './FilterType';

export interface ScanFilter{
    getType():FilterType;
    getTypeString():string;
}
