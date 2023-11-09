import { FilterType } from "./FilterType";
import { ScanFilter } from "./ScanFilter";
import { Pipe, PipeTransform } from '@angular/core'

export class NameFilter implements ScanFilter{
    private Name:string;

    constructor(Name:string){
        this.Name = Name;
    }

    public getType(): FilterType {
        return FilterType.Name;
    }
    
    public getTypeString(): string {
        return FilterType[FilterType.Name];
    }

    public getName(): string{
        return this.Name;
    }
}

@Pipe({
    name: 'NameFilterPipe',
    pure: true,
  })
export class NameFilterPipe implements PipeTransform {
    transform(value: ScanFilter): NameFilter {
        return value.getType() == FilterType.Name ? value as NameFilter : undefined ; 
    }
}
