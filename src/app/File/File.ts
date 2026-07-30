export class File {
	private fileName: string;
	private fileDataRaw: ArrayBufferLike;

	constructor(name: string, dataRaw: ArrayBufferLike) {
		this.fileName = name;
		this.fileDataRaw = dataRaw;
	}

	getFileName(): string {
		return this.fileName;
	}

	getFileDataRaw(): ArrayBufferLike {
		return this.fileDataRaw;
	}

	static async parseDataBase64toBuffer(
		fileDataBase64: string,
	): Promise<ArrayBufferLike> {
		let binaryString = atob(fileDataBase64);
		let bytes = new Uint8Array(binaryString.length);
		for (var i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}
}
