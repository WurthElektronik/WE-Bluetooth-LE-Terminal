import { FilterType } from "./FilterType";
import { ScanFilter } from "./ScanFilter";
import { Pipe, PipeTransform } from '@angular/core'

export class ServiceUUIDFilter implements ScanFilter{
    private ServiceUUID:string;

    constructor(ServiceUUID:string){
        this.ServiceUUID = ServiceUUID;
    }

    public getType(): FilterType {
        return FilterType.ServiceUUID;
    }

    public getTypeString(): string {
        return FilterType[FilterType.ServiceUUID];
    }

    public getServiceUUID(): string{
        return this.ServiceUUID;
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
