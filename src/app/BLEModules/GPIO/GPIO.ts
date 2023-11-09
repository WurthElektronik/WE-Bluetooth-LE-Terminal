import { GPIOPin } from "./GPIOPin";

export class GPIO{

    private gpioPins: Map<number, GPIOPin>;
    private tempgpioPins: Map<number, GPIOPin>;
    
    constructor(gpioPins: Map<number, GPIOPin>){
        this.gpioPins = gpioPins;
        this.tempgpioPins = new Map<number, GPIOPin>;
        this.resetTempGPIOPins(Array.from(this.getGPIOPins().values()));
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
}
