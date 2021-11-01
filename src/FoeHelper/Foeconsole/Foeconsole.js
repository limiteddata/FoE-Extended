
const EventEmitter = require("events");

class Foeconsole extends EventEmitter{  
    logs = [];
    maxLength = 65;
    constructor(){
        super();
    }
    log(...args){
        const text = args.map(arg=>{
            if(arg.constructor !== String) return JSON.stringify(arg,null, "\t")
            return arg
        })
        this.logs.push({timestamp: new Date().toTimeString().slice(0,8), text: text.join(' ')})
        if(this.logs.length>=this.maxLength) this.logs.shift();
        console.log(this.getLastLog());
        this.emit("logsChanged", this.getLogs());
    }
    getLogs(){
        return this.logs.map(log=>`${log.timestamp}    ${log.text}`).join('\n');
    }
    getLastLog(){
        const lastLog = this.logs[this.logs.length-1]
        return `${lastLog.timestamp}    ${lastLog.text}\n`
    }
}

const FoEconsole = new Foeconsole();
FoEconsole.log(`FOE Extended v${VERSION} loaded!`);

export { FoEconsole }