export function BufferToAscii(buffer):string {
    return String.fromCharCode.apply(null, new Uint8Array(buffer)).replace(/[^\x20-\x7E]/g, "☐");
}

export function AsciiToBuffer(asciistring:string):ArrayBuffer {
    return Uint8Array.from(asciistring, x => x.charCodeAt(0)).buffer;
}

export function CheckAscii(asciistring:string):Boolean{
    let asciiregex = /^[\x20-\x7E]*$/;
    return asciiregex.test(asciistring);
}

export function InputFilterAscii(inputstring:String){
    return inputstring.replace(/[^\x20-\x7E]/g,'');
}