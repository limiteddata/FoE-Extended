import { v4 as uuid} from 'uuid';

class FoeProxy {
    handlers = {};
    debug = false;
    constructor(){         
        // proxy response messages
        const XHR = XMLHttpRequest.prototype;
        const open = XHR.open;
        const send = XHR.send;
        XHR.open = function(method, url) {
            this._method = method;
            this._url = url;
            return open.apply(this, arguments);
        };
        XHR.send = function() {
            try{
                this.addEventListener('load', () => {
                    if(this._method == 'POST') 
                        checkResponse(JSON.parse( this.responseText ));
                });
            } catch (e) {
                console.error(e);
            }
            return send.apply(this, arguments);
        };
        // proxy websockets messages
        const oldWSSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
            oldWSSend.call(this, data);
            this.addEventListener('message', wsMessageHandler, { capture: false, passive: true });
        };
        function wsMessageHandler(evt) {
            try {
                if (evt.data === 'PING' || evt.data === 'PONG') return;
                    checkResponse(JSON.parse(evt.data));
            } catch (e) {
                console.error(e);
            }
        }
        const checkResponse = (response)=>{
            if(this.debug) console.log(response);
            for (let i = 0; i < response.length; i++) {
                if(this.handlers.hasOwnProperty(response[i]['requestMethod']) ){
                    try {
                        for (let x = 0; x < this.handlers[response[i]['requestMethod']].length; x++) 
                            this.handlers[response[i]['requestMethod']][x].callback(response[i]['responseData']);
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }
    }
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
}
const FoEProxy = new FoeProxy();
export { FoEProxy }


