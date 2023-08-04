import { GPIOPin } from "./GPIOPin";

export interface GPIOModule{
    gpioPins:Map<number, GPIOPin>;
    tempgpioPins:Map<number, GPIOPin>;
    getGPIOPins():Map<number, GPIOPin>;
    getTempGPIOPins():Map<number, GPIOPin>;
    copyToTempGPIOPins();
    formatreadpinconfiguration(): DataView;
}