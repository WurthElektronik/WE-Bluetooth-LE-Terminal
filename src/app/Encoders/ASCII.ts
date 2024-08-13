export function BufferToAscii(buffer, only_printable_ascii: boolean):string {
    let regex = only_printable_ascii ? /[^\x20-\x7E]/g : /[^\x00-\x7F]/g;
    return String.fromCharCode.apply(null, new Uint8Array(buffer)).replace(regex,"☐");
}

export function AsciiToBuffer(asciistring:string):ArrayBuffer {
    return Uint8Array.from(asciistring, x => x.charCodeAt(0)).buffer;
}

export function CheckAscii(asciistring:string, only_printable_ascii: boolean):Boolean{
    let asciiregex = only_printable_ascii ? /^[\x20-\x7E]*$/ : /^[\x00-\x7F]*$/;
    return asciiregex.test(asciistring);
}

export function InputFilterAscii(inputstring:String, only_printable_ascii: boolean){
    let regex = only_printable_ascii ? /[^\x20-\x7E]/g : /[^\x00-\x7F]/g;
    return inputstring.replace(regex,'');
}
