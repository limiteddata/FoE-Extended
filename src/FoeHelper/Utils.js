function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function getResponseMethod(json, methodName){
    for(var i = 0; i<json.length; i++){
        if(json[i]["requestMethod"] === methodName) return json[i]['responseData'];
    }
    return null;
}
function requestJSON(requestClass,requestMethod,requestData=[]){
    return [{"__class__":"ServerRequest","requestData":requestData,"requestClass":requestClass,"requestMethod":requestMethod}];
}
export {wait, requestJSON,getResponseMethod}