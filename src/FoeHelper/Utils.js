function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function getResponseMethod(json, methodName){
    var response = [];
    for(var i = 0; i<json.length; i++){
        if(json[i]["requestMethod"] === methodName)
            response.push(json[i]['responseData']);
    }
    if(response.length === 1) return response[0];
    else if(response.length > 1) return response;
    else return null;
}
function requestJSON(requestClass,requestMethod,requestData=[],raw=false){
    if(raw) return {"__class__":"ServerRequest","requestData":requestData,"requestClass":requestClass,"requestMethod":requestMethod};
    return [{"__class__":"ServerRequest","requestData":requestData,"requestClass":requestClass,"requestMethod":requestMethod}];
}
export {wait, requestJSON,getResponseMethod}