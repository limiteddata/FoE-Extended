import { v4 as uuid} from 'uuid';
    
class URLResolver{
    constructor(){
        this.chachedURL= {}; 

    }
    resolve(path){
        if (this.chachedURL.hasOwnProperty(path))
            return this.chachedURL[path]
        const id = uuid();
        let url = '';
        window.addEventListener('resolvedImage', (msg) => {
            if(msg.detail.id === id){
                url = msg.detail.url
                window.removeEventListener('resolvedImage',()=>{})
            }
        }) 
        window.dispatchEvent( new CustomEvent('imageResolver', {detail:{id:id,path:path}}))
        this.chachedURL[path] = url;
        return url
    }
}
const urlResolver = new URLResolver();
export { urlResolver }