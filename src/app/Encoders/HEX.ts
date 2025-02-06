import { Encoder } from "./Encoder";
import { EncodingType } from "./EncodingType";

export abstract class HEX extends Encoder{

    static BufferToEncoding(buffer: ArrayBuffer): string {
        return [...new Uint8Array(buffer)]
        .map (b => b.toString(16).padStart(2, "0"))
        .join (" ").toUpperCase();
    }

    static EncodingToBuffer(encodingString: string): ArrayBuffer {
        return new Uint8Array(encodingString.replace(/ /g,'').match(/../g).map(h=>parseInt(h,16))).buffer;
    }

    static CheckEncoding(encodingString: string) {
        let hexregex = /^[0-9A-F]+$/;
        let hexstringnpspaces = encodingString.replace(/ /g,'');
        return hexregex.test(hexstringnpspaces) && (hexstringnpspaces.length % 2 == 0);
    }

    static InputFilterEncoding(inputString: string) {
        return inputString.replace(/[^0-9A-F]/g,'').replace(/(.{2})/g, "$1 ").trim();
    }

    static getEncodingType(): EncodingType {
        return EncodingType.HEX;
    }

    static getEncodingTypeString(): string
    {
        return EncodingType[this.getEncodingType()];
    }
    
}
