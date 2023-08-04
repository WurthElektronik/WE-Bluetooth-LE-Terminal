import { BleDevice } from "@capacitor-community/bluetooth-le";

import { GeneralBLEModule } from "../GeneralBLEModule";
import { GPIOPin } from "./GPIOPin";
import { LogMessageType } from "src/app/Logger/LogMessageType";

export abstract class GeneralBLEGPIOModule extends GeneralBLEModule{

    gpioPins: Map<number, GPIOPin>;
    tempgpioPins: Map<number, GPIOPin>;

    constructor(bledevice:BleDevice){
        super(bledevice);
        this.tempgpioPins = new Map<number, GPIOPin>;
    }
    
    getTempGPIOPins(): Map<number, GPIOPin> {
        return this.tempgpioPins;
    }

    getGPIOPins(): Map<number, GPIOPin> {
        return this.gpioPins;
    }

    resetTempGPIOPins(pins: GPIOPin[]){

        for(let pin of pins){
            this.tempgpioPins.set(pin.getPinID(), GPIOPin.copy(this.gpioPins.get(pin.getPinID())));
        }

    }

    logGPIO(msginfo:string, msginfoparameters: any = undefined, msgdata:ArrayBuffer = undefined){
        this.logger.logMessage(LogMessageType.GPIO,msginfo,msginfoparameters,msgdata);
    }

    getGPIOSupport():Boolean{
        return true;
    }

    abstract formatreadpinconfiguration(): DataView;

    abstract formatwritepinconfiguration(pins: GPIOPin[]):DataView;

    abstract formatreadpinvalues(pins: GPIOPin[]):DataView;

    abstract formatwritepinvalues(pins: GPIOPin[]):DataView;
}