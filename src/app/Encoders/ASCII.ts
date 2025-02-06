import { Encoder } from "./Encoder";
import { EncodingType } from "./EncodingType";

export abstract class ASCII extends Encoder{

    static BufferToEncoding(buffer: ArrayBuffer): string {
        let regex = /[^\x00-\x7F]/g;
        return String.fromCharCode.apply(null, new Uint8Array(buffer)).replace(regex,"☐");
    }
    
    static EncodingToBuffer(encodingString: string): ArrayBuffer {
        return Uint8Array.from(encodingString, x => x.charCodeAt(0)).buffer;
    }

    static CheckEncoding(encodingString: string) {
        let asciiregex = /^[\x00-\x7F]*$/;
        return asciiregex.test(encodingString);
    }

    static InputFilterEncoding(inputString: string) {
        let regex = /[^\x00-\x7F]/g;
        return inputString.replace(regex,'');
    }

    static getEncodingType(): EncodingType {
        return EncodingType.ASCII;
    }

    static getEncodingTypeString(): string
    {
        return EncodingType[this.getEncodingType()];
    }

}
