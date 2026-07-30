import { EncodingType } from './EncodingType';

export abstract class Encoder {
	abstract BufferToEncoding(buffer: ArrayBufferLike): string;
	abstract EncodingToBuffer(encodingString: string): ArrayBufferLike;
	abstract CheckEncoding(encodingString: string);
	abstract InputFilterEncoding(inputString: string);
	abstract getEncodingType(): EncodingType;
	abstract getEncodingTypeString(): string;
}
