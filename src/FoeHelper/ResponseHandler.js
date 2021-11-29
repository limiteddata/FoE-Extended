import { v4 as uuid} from 'uuid';

export default class ResponseHandler{
    constructor(){}
    handlers = {};
    addHandler = (requestClass, requestMethod,callback)=>{
        if(!this.handlers[`${requestClass}:${requestMethod}`]) 
            this.handlers[`${requestClass}:${requestMethod}`] = [];
        const handler = {
            id: uuid(), 
            requestClass: requestClass, 
            requestMethod: requestMethod, 
            callback: callback
        }
        this.handlers[`${requestClass}:${requestMethod}`].push( handler )
        return handler;
    }
    removeHandler = (handler)=>{
        if(!this.handlers[`${handler.requestClass}:${handler.requestMethod}`]) return;
        const newHandlers = this.handlers[`${handler.requestClass}:${handler.requestMethod}`].filter(hd=> hd.id !== handler.id)
        this.handlers[`${handler.requestClass}:${handler.requestMethod}`] = newHandlers;
    } 
    handleCallbacks = (requestClass, requestMethod, responseData)=>{
        try {
            if(!this.handlers.hasOwnProperty(`${requestClass}:${requestMethod}`) ) return;
            for (let x = 0; x < this.handlers[`${requestClass}:${requestMethod}`].length; x++) 
                this.handlers[`${requestClass}:${requestMethod}`][x].callback(responseData);
        } catch (error) {
            console.log(error)
        }
    }
}


