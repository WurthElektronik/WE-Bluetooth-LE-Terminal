import { EncodingType } from "./EncodingType";

export abstract class Encoder{
    abstract BufferToEncoding(buffer:ArrayBuffer):string;
    abstract EncodingToBuffer(encodingString:string):ArrayBuffer;
    abstract CheckEncoding(encodingString:string);
    abstract InputFilterEncoding(inputString:string);
    abstract getEncodingType():EncodingType;
    abstract getEncodingTypeString():string;
}
