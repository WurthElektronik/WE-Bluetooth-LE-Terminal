export class File {
	private fileName: string;
	private fileDataRaw: ArrayBuffer;

	constructor(name: string, dataRaw: ArrayBuffer) {
		this.fileName = name;
		this.fileDataRaw = dataRaw;
	}

	getFileName(): string {
		return this.fileName;
	}

	getFileDataRaw(): ArrayBuffer {
		return this.fileDataRaw;
	}

	static async parseDataBase64toBuffer(
		fileDataBase64: string,
	): Promise<ArrayBuffer> {
		let binaryString = atob(fileDataBase64);
		let bytes = new Uint8Array(binaryString.length);
		for (var i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}
}
