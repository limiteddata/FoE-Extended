// this timer class improves interval cycle by only having a single interval and gives the posibiliti to use seconds instead of ms
class GlobalTimer{
    currentTimestamp = -1;
    #handlers = [];
    #interval=null;
    constructor(){    
        // start the timer by default
        this.start();
    }
    /**
     * start the timer
     */
    start(){
        this.#interval = setInterval(async ()=>{
            this.currentTimestamp = Math.floor(Date.now() / 1000);            
            for (let i = 0; i < this.#handlers.length; i++) {
                if(this.currentTimestamp >= this.#handlers[i].timestamp && !this.#handlers[i].called) {
                    this.#handlers[i].called = true;
                    await this.#handlers[i].callback();
                    // reset the timestamp with the interval
                    if (this.#handlers[i].interval) {
                        this.#handlers[i].timestamp += this.#handlers[i].interval;
                        this.#handlers[i].called = false;
                    }
                }
            }
        },1000);
    }
    /**
     * stop the timer
     */
    stop(){
        clearInterval(this.#interval);
    }
    /**
     * clear all the handlers
     */
    clearHandlers(){
        this.#handlers = [];
    }

    /**
     * This is the equivalent of setInterval but in seconds
     * @param {number} key 
     * @param {int} sec
     * @param {function} callback 
     * @returns handler
     */
    addHandler(key, sec, callback){
        const attimestamp = Math.floor(Date.now() / 1000) + sec;
        // check if handler already exists
        const handlerIndex = this.__checkifexists(key);
        if(handlerIndex>-1){
            this.#handlers[handlerIndex] = {
                key: this.#handlers[handlerIndex].key,
                timestamp: attimestamp,
                interval: sec,
                callback: callback,
                called:false
            };
            return this.#handlers[handlerIndex];
        }
        const handler = {
            key: key,
            interval: sec,
            timestamp: attimestamp,
            callback: callback,
            called:false
        };
        this.#handlers.push(handler);
        return handler;
    }

    /**
     * This is the equivalent of settimeout but in seconds
     * @param {number} key 
     * @param {int} atTimestamp the time in seconds that the callback will be called
     * @param {function} callback 
     * @returns handler
     */
    addHandlerAt(key, atTimestamp, callback){
        // check if handler already exists
        const handlerIndex = this.__checkifexists(key);
        if(handlerIndex>-1){
            this.#handlers[handlerIndex] = {
                key: this.#handlers[handlerIndex].key,
                timestamp: atTimestamp,
                callback: callback,
                called:false
            };
            return this.#handlers[handlerIndex];
        }
        const handler = {
            key: key,
            timestamp: atTimestamp,
            callback: callback,
            called:false
        };
        this.#handlers.push(handler);
        return handler;
    }
    __checkifexists(key){
        for (let i = 0; i < this.#handlers.length; i++) {
            if(this.#handlers[i].key === key) return i;
        }
        return -1;
    }
}
const timer = new GlobalTimer();
export { timer,  GlobalTimer}
