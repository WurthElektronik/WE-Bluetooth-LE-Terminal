import { GPIO } from "./GPIO";
import { GPIOPin } from "./GPIOPin";

export interface GPIOInterface{
    getGPIO(): GPIO; 
    formatreadpinconfiguration():DataView;
    formatwritepinconfiguration(pins: GPIOPin[]):DataView;
    formatreadpinvalues(pins: GPIOPin[]):DataView;
    formatwritepinvalues(pins: GPIOPin[]):DataView;
}
