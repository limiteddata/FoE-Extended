// this timer class improves interval cycle by only having a single interval and gives the posibiliti to use seconds instead of ms
class GlobalTimer{
    currentTimestamp = -1;
    handlers = [];
    #interval=null;
    timeoffset=1;
    constructor(startTimer = true){    
        // start the timer by default
        if(startTimer) this.start();
    }
    /**
     * start the timer
     */
    start = ()=>{
        this.#interval = setInterval(async ()=>{
            this.currentTimestamp = Math.floor(Date.now() / 1000);    
            for (let i = 0; i < this.handlers.length; i++) {
                if (this.handlers[i].type === 'loop') {
                    this.handlers[i].timeLeft --;
                    if(this.handlers[i].timeLeft !== 0) continue;
                    await this.handlers[i].callback();
                    this.handlers[i].timeLeft = this.handlers[i].timestamp;
                }
                else if (this.handlers[i].type === 'in') {
                    this.handlers[i].timeLeft --;
                    if(this.handlers[i].timeLeft !== 0) continue;
                    await this.handlers[i].callback();
                    if(this.handlers[i].removeHandler) this.handlers.splice(i,1);   
                }
                else if (this.handlers[i].type === 'at' && !this.handlers[i].called) {
                    if(this.currentTimestamp <= this.handlers[i].timestamp) continue;
                    this.handlers[i].called = true;
                    await this.handlers[i].callback();
                    if(this.handlers[i].removeHandler) this.handlers.splice(i,1);
                }
            }
        },1000);
    }
    /**
     * stop the timer
     */
    stop = ()=>{
        clearInterval(this.#interval);
    }
    /**
     * clear all the handlers
     */
    clearHandlers(){
        this.handlers = [];
    }
    __checkifexists = (key)=>{
        for (let i = 0; i < this.handlers.length; i++) {
            if(this.handlers[i].key === key) return i;
        }
        return -1;
    }

    addHandlerLoop = (key, sec, callback)=>{
        const handlerIndex = this.__checkifexists(key);
        if(handlerIndex>-1){
            this.handlers[handlerIndex] = {
                type:'loop',
                key: key,
                timestamp: sec,
                timeLeft: sec,
                callback: callback,
            }
            return this.handlers[handlerIndex];
        }
        const handler = {
            type:'loop',
            key: key,
            timestamp: sec,
            callback: callback,
            timeLeft: sec
        }
        this.handlers.push(handler);
        return handler;
    }
    addHandlerIn = (key, inTimestamp, callback, removeHandler=true)=>{
        const handlerIndex = this.__checkifexists(key);
        if(handlerIndex>-1){
            this.handlers[handlerIndex] = {
                type:'in',
                key: key,
                timestamp: inTimestamp+this.timeoffset,
                callback: callback,
                timeLeft: inTimestamp+this.timeoffset,
                removeHandler: removeHandler
            }
            return this.handlers[handlerIndex];
        }
        const handler = {
            type:'in',
            key: key,
            timestamp: inTimestamp+this.timeoffset,
            callback: callback,
            timeLeft: inTimestamp+this.timeoffset,
            removeHandler: removeHandler
        }
        this.handlers.push(handler);
        return handler;
    }
    addHandlerAt = (key, atTimestamp, callback, removeHandler=true)=>{
        const handlerIndex = this.__checkifexists(key);
        if(handlerIndex>-1){
            this.handlers[handlerIndex] = {
                type:'at',
                key: key,
                timestamp: atTimestamp+this.timeoffset,
                callback: callback,
                called:false,
                removeHandler: removeHandler
            }
            return this.handlers[handlerIndex];
        }
        const handler = {
            type:'at',
            key: key,
            timestamp: atTimestamp+this.timeoffset,
            callback: callback,
            called:false,
            removeHandler: removeHandler
        }
        this.handlers.push(handler);
        return handler;
    }
    removeHandler = (handler)=>{
        if(!handler.key) return;
        const index = this.__checkifexists(handler.key);
        if(index === -1) return;
        this.handlers.splice(index,1);
    }
    removeHandlers(handlers){
        for(const handler of handlers) this.removeHandler(handler);
    }
    updateHandler = (key, time)=>{
        const index = this.__checkifexists(key);
        if(index === -1) return;
        this.handlers[index].timestamp = time;
        if(this.handlers[index].timeLeft !== null && this.handlers[index].timeLeft === 0) this.handlers[index].timeLeft = time;
        if(this.handlers[index].called !== null && this.handlers[index].called === true) this.handlers[index].called = false;
    }
}
const timer = new GlobalTimer();
export { timer,  GlobalTimer}