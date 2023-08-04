import { LogMessageType } from "./LogMessageType";

export class LogMessage{
  private type: LogMessageType;
  private timestamp: number;
  private msginfo:string;
  private msginfoparameters:any;
  private msgdata:ArrayBuffer;

  constructor(type:LogMessageType, timestamp:number, msginfo: string, msginfoparameters: any = undefined, msgdata:ArrayBuffer = undefined){
    this.type = type;
    this.timestamp = timestamp;
    this.msginfo = msginfo;
    this.msginfoparameters = msginfoparameters;
    this.msgdata = msgdata;
  }

  getTimestamp():number {
    return this.timestamp;
  }

  getTimestampString():string {
    let time =  new Date(this.timestamp);
    let hours = time.getHours().toString().padStart(2,'0');
    let minutes = time.getMinutes().toString().padStart(2,'0');
    let seconds = time.getSeconds().toString().padStart(2,'0');
    let milliseconds = time.getMilliseconds().toString().padStart(3,'0');
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }

  getMsgData():ArrayBuffer {
    return this.msgdata;
  }

  getMsgInfo():string {
    return this.msginfo;
  }

  getMsgInfoParameters() {
    return this.msginfoparameters;
  }

  getType():LogMessageType{
    return this.type;
  }

}