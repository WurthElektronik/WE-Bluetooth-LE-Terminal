import { LogMessage } from "./LogMessage";
import { LogMessageType } from "./LogMessageType";
import { Subject } from 'rxjs';
export class Logger{

    private onDatalogged: Subject<any> = new Subject<any>();
    private logmessages:LogMessage[] = [];

    constructor(){
    }

    clearLog(){
        this.logmessages = [];
        this.onDatalogged.next(undefined);
    }

    logMessage(type: LogMessageType, msginfo: string, msginfoparameters:any = undefined, msgdata:ArrayBuffer = undefined){
        this.logmessages.push(new LogMessage(type,Date.now(),msginfo,msginfoparameters,msgdata));
        this.onDatalogged.next(undefined);
    }

    getMessages(types:LogMessageType[] = []){
        if (types.length == 0) {
            return this.logmessages;
        }else{
            return this.logmessages.filter(msg => {
                return types.includes(msg.getType());
            });
        }
    }

    getDataLoggedSubject():Subject<any>{
        return this.onDatalogged;
    }

}