import { GPIOPinType } from "./GPIOPinType";


export class GPIOPin{
    private pinid:number;
    private pinname:string;
    private pwmsupport:Boolean;
    private pintype:GPIOPinType = GPIOPinType.NoConfiguration;
    private pinconfigvalue:DataView;
    private pinvalue:DataView;
    
    constructor(pinid:number, pinname:string, pwmsupport:Boolean){
        this.pinid = pinid;
        this.pinname = pinname;
        this.pwmsupport = pwmsupport;
        this.pinconfigvalue = new DataView(new ArrayBuffer(4));
        this.pinvalue = new DataView(new ArrayBuffer(1));
    }
    
    getPinID():number{
        return this.pinid;
    }

    getPinName():string{
        return this.pinname;
    }

    getPWMSupport():Boolean{
        return this.pwmsupport;
    }

    setPinType(type:GPIOPinType){
        this.pintype = type;
    }

    getPinType():GPIOPinType{
        return this.pintype;
    }

    getIsConfigured():Boolean{
        return this.pintype != GPIOPinType.NoConfiguration;
    }

    getPinConfigValue():DataView{
        return this.pinconfigvalue;
    }

    getPinValue():DataView{
        return this.pinvalue;
    }

    static copy(pin:GPIOPin):GPIOPin{
        let json = JSON.parse(JSON.stringify(pin))
        delete json.pinvalue;
        delete json.pinconfigvalue;
        let gpioPin:GPIOPin = new this(json.pinid,json.pinname,json.pwmsupport);
        Object.assign(gpioPin,json)
        gpioPin.getPinConfigValue().setUint32(0,pin.getPinConfigValue().getUint32(0));
        gpioPin.getPinValue().setUint8(0,pin.getPinValue().getUint8(0));
        return gpioPin;
    }

}