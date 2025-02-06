import { BLEProfileType } from "../BLEProfiles/BLEProfileType";
import { GeneralBLEProfile } from "../BLEProfiles/GeneralBLEProfile";
import { FilterType } from "./FilterType";
import { ScanFilter } from "./ScanFilter";
import { Pipe, PipeTransform } from '@angular/core'

export class ServiceUUIDFilter implements ScanFilter{
    private profile:GeneralBLEProfile;
    
    constructor(profile:GeneralBLEProfile){
        this.profile = profile;
    }

    public getType(): FilterType {
        return FilterType.ServiceUUID;
    }

    public getTypeString(): string {
        return FilterType[FilterType.ServiceUUID];
    }

    public getServiceUUID(): string{
        return this.profile.getService().uuid;
    }

    public getServiceName(): string
    {
        return BLEProfileType[this.profile.getType()];
    }
}

@Pipe({
    name: 'ServiceUUIDFilterPipe',
    pure: true,
  })
export class ServiceUUIDFilterPipe implements PipeTransform {
    transform(value: ScanFilter): ServiceUUIDFilter {
        return value.getType() == FilterType.ServiceUUID ? value as ServiceUUIDFilter : undefined ; 
    }
}
