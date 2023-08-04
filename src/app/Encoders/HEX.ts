export function BufferToHex(buffer):string {
    return [...new Uint8Array(buffer)]
        .map (b => b.toString(16).padStart(2, "0"))
        .join (" ").toUpperCase();
}

export function HexToBuffer(hexstring:string):ArrayBuffer {
    return new Uint8Array(hexstring.match(/../g).map(h=>parseInt(h,16))).buffer;
}


export function CheckHex(hexstring:string):Boolean{
    let hexregex = /^[0-9a-fA-F]+$/;
    return hexregex.test(hexstring) && (hexstring.length % 2 == 0);
}

export function InputFilterHex(inputstring:String){
    return inputstring.replace(/[^0-9a-fA-F]/g,'');
}