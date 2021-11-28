import { v4 as uuid} from 'uuid';

export default class ResponseHandler{
    constructor(){}
    handlers = {};
    addHandler = (responseMethod,callback)=>{
        if(!this.handlers[responseMethod]) this.handlers[responseMethod] = [];
        const handler = {id: uuid(), responseMethod: responseMethod, callback:callback}
        this.handlers[responseMethod].push( handler )
        return handler;
    }
    removeHandler = (handler)=>{
        if(!this.handlers[handler.responseMethod]) return;
        const newHandlers = this.handlers[handler.responseMethod].filter(hd=> hd.id !== handler.id)
        this.handlers[handler.responseMethod] = newHandlers;
    } 
    handleCallbacks = (requestMethod,data)=>{
        try {
            if(!this.handlers.hasOwnProperty(requestMethod) ) return;
            for (let x = 0; x < this.handlers[requestMethod].length; x++) 
                this.handlers[requestMethod][x].callback(data);
        } catch (error) {
            console.log(error)
        }
    }
}


