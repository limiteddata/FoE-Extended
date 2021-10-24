import { FoERequest } from "../FoeRequest";
import { requestJSON } from "../Utils";

const EventEmitter = require("events");

class FoePlayers extends EventEmitter{  
    constructor(){
        super();
    }
    async getFriendsList(self=false){
        const request = requestJSON("OtherPlayerService","getFriendsList");
        let response = await FoERequest.FetchRequestAsync(request,0);
        if(self!==true) response = response.filter(player=>player.is_self === false) 
        return response
    }
    async getClanMemberList(self=false){
        const request = requestJSON("OtherPlayerService","getClanMemberList");
        let response = await FoERequest.FetchRequestAsync(request,0);
        if(self!==true) response = response.filter(player=>player.is_self === false)
        return response
    }
    async getNeighborList(self=false){
        const request = requestJSON("OtherPlayerService","getNeighborList");
        let response = await FoERequest.FetchRequestAsync(request,0);
        if(self!==true) response = response.filter(player=>player.is_self === false) 
        return response
    }
    async getTavernSeats(){   
        const request = requestJSON("FriendsTavernService","getOwnTavern");
        const response = await FoERequest.FetchRequestAsync(request,0);

        const unlockedChairs = response["view"]["unlockedChairs"];
        const occupiedSeats = response["view"]["visitors"].length;

        return {"unlockedChairs":unlockedChairs,"occupiedSeats":occupiedSeats};
    }
    async visitPlayerCity(playerId){   
        const request = requestJSON("OtherPlayerService","visitPlayer",[playerId])  
        return await FoERequest.FetchRequestAsync(request,0);
    }
}

const FoEPlayers = new FoePlayers();

export { FoEPlayers }