export function BufferToHex(buffer):string {
    return [...new Uint8Array(buffer)]
        .map (b => b.toString(16).padStart(2, "0"))
        .join (" ").toUpperCase();
}

export function HexToBuffer(hexstring:string):ArrayBuffer {
    return new Uint8Array(hexstring.match(/../g).map(h=>parseInt(h,16))).buffer;
}


export function CheckHex(hexstring:string):Boolean{
    let hexregex = /^[0-9A-F]+$/;
    let hexstringnpspaces = hexstring.replace(/ /g,'');
    return hexregex.test(hexstringnpspaces) && (hexstringnpspaces.length % 2 == 0);
}

export function InputFilterHex(inputstring:String){
    return inputstring.replace(/[^0-9A-F]/g,'').replace(/(.{2})/g, "$1 ").trim();
}