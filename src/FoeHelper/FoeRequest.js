import md5 from 'md5';
import { wait, getResponseMethod } from './Utils';

class FoeRequest{
    gameOptions = {
        secret: null,
        version: null,
        requiredVersion: null,
        userKey: null,
        requestId:0,
    };
    constructor(){
        let scripts = document.getElementsByTagName('script');
        fetch(scripts[scripts.length-1].src).then(resp=>resp.text()).then(responseText=>{
            this.gameOptions.secret = responseText.split("VERSION_SECRET=\"")[1].split("\";")[0];
            this.gameOptions.version = responseText.split("[\"version=")[1].split("\",")[0];
            this.gameOptions.requiredVersion = responseText.split(",\"requiredVersion=")[1].split("\",")[0];
            this.gameOptions.userKey = window.gameVars.gatewayUrl.split("forgeofempires.com/game/json?h=")[1];
        }).then(()=>this.isReady = true)
        this.Signature = (userKey, secret, body)=>{  
            let data = userKey + secret + JSON.stringify(body);
            return md5(data).toString(16).slice(0, 10);
        }
    }
    FetchRequestAsync = async (request, delay=400) => {
        if(!this.isReady){
            await wait(1000);
            if(!this.isReady){
                console.log('Extension is not ready!')
                return null;
            }
        }
        if(delay !== 0) await wait(delay);
        request.forEach(element => element["requestId"] = this.gameOptions.requestId++  ); 
        return fetch(`/game/json?h=${this.gameOptions.userKey}`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Client-Identification': `version=${this.gameOptions.version}; requiredVersion=${this.gameOptions.requiredVersion}; platform=bro; platformType=html5; platformVersion=web`,
                'Signature': this.Signature(this.gameOptions.userKey,this.gameOptions.secret,request),
            },
            body: JSON.stringify(request)})
            .then(e=>e.json())
            .then(response=> getResponseMethod(response, request[0]['requestMethod']) )
    }
    XHRRequestAsync = async (request, delay=400)=>{
        if(!this.isReady){
            await wait(1000);
            if(!this.isReady){
                console.log('Extension is not ready!')
                return null;
            }
        }
        return new Promise(async (succes,reject)=>{
            if(delay !== 0) await wait(delay);
            request.forEach(element => element["requestId"] = this.gameOptions.requestId++  );     
            const xhr = new XMLHttpRequest();
    
            xhr.open('POST', `/game/json?h=${this.gameOptions.userKey}`,true);
            xhr.setRequestHeader('Client-Identification', `version=${this.gameOptions.version}; requiredVersion=${this.gameOptions.requiredVersion}; platform=bro; platformType=html5; platformVersion=web`);
            xhr.setRequestHeader('Signature', this.Signature(this.gameOptions.userKey,this.gameOptions.secret,request));
            xhr.setRequestHeader('Content-Type', 'application/json');
    
            xhr.onload =  function () {
                if (this.status >= 200 && this.status < 300) {    
                    succes(xhr.response)
                }else reject()
            }; 
            xhr.send(JSON.stringify(request));
        }).then(responseText=>getResponseMethod(JSON.parse(responseText), request[0]['requestMethod']))
    }
}

const FoERequest = new FoeRequest();

export { FoERequest }