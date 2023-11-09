export class ProteusHighThroughput{

    private fragmentsData:DataView[];
    
    constructor(){
        this.fragmentsData = [];
    }

    getFragmentsDataByIndex(i: number): DataView{
        return this.fragmentsData[i];
    }

    setFragmentsDataAtIndex(i: number, data: DataView){
        this.fragmentsData[i] = data;
    }
}
