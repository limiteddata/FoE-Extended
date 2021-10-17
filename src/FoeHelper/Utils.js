function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function getResponseMethod(json, methodName){
    for(var i = 0; i<json.length; i++){
        if(json[i]["requestMethod"] === methodName) return json[i]['responseData'];
    }
    return null;
}
export {wait, getResponseMethod}