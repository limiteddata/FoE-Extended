import md5 from 'md5';
import { wait, getResponseMethod } from './Utils';
import ResponseHandler from './ResponseHandler';

class FoeRequest extends ResponseHandler{
    gameOptions = {
        secret: null,
        version: null,
        requiredVersion: null,
        userKey: null,
        requestId:0,
    };
    _this;
    constructor(){
        super();
        let scripts = document.getElementsByTagName('script');
        fetch(scripts[scripts.length-1].src).then(resp=>resp.text()).then(responseText=>{
            this.gameOptions.secret = responseText.split("VERSION_SECRET=\"")[1].split("\";")[0];
            this.gameOptions.version = responseText.split("[\"version=")[1].split("\",")[0];
            this.gameOptions.requiredVersion = responseText.split(",\"requiredVersion=")[1].split("\",")[0];
            this.gameOptions.userKey = window.gameVars.gatewayUrl.split("forgeofempires.com/game/json?h=")[1].split("',")[0];
        }).then(()=>this.isReady = true)
    }
    Signature = (userKey, secret, body)=>{  
        let data = userKey + secret + JSON.stringify(body);
        return md5(data).toString(16).slice(0, 10);
    }

    FetchRequestAsync = async (request, {delay=600, raw=false}={})=>{
        if(!this.isReady){
            await wait(1500);
            if(!this.isReady) throw 'Extension is not ready!';
        }
        if(delay !== 0) await wait(delay);
        request["requestId"] = this.gameOptions.requestId++;
        return new Promise( (res, rej) => {
            const channel = new MessageChannel(); 
            channel.port1.onmessage = ({data}) => {
              channel.port1.close();
              if (data.error) rej(data.error);
              else {
                    let response = data.result;
                    for (let i = 0; i < response.length; i++) this.handleCallbacks(response[i].requestMethod,response[i].responseData);
                    res( raw ? response : getResponseMethod(response, request[0]['requestMethod']) );
              }
            };
            window.postMessage({
                type:"PageFetch", 
                url:`/game/json?h=${this.gameOptions.userKey}`,
                options: {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Client-Identification': `version=${this.gameOptions.version}; requiredVersion=${this.gameOptions.requiredVersion}; platform=bro; platformType=html5; platformVersion=web`,
                        'Signature': this.Signature(this.gameOptions.userKey,this.gameOptions.secret,request),
                    },
                    body: JSON.stringify(request)
                }

            },'*', [channel.port2]);

          });
    }
}

const FoERequest = new FoeRequest();

export { FoERequest }