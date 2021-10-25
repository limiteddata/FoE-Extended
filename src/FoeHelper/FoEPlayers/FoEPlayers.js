import { FoERequest } from "../FoeRequest";
import { requestJSON } from "../Utils";

const EventEmitter = require("events");

class FoePlayers extends EventEmitter{  
    constructor(){
        super();
    }
    async getFriendsList(){
        const request = requestJSON("OtherPlayerService","getFriendsList");
        const response = await FoERequest.FetchRequestAsync(request,0);
        return response;
    }
    async getClanMemberList(){
        const request = requestJSON("OtherPlayerService","getClanMemberList");
        const response = await FoERequest.FetchRequestAsync(request,0);
        return response;
    }
    async getNeighborList(is_self=false,is_friend=false,is_guild_member=false){
        const request = requestJSON("OtherPlayerService","getNeighborList");
        let response = await FoERequest.FetchRequestAsync(request,0);
        return response.filter(player=>
            player.is_self === is_self && 
            player.is_friend === is_friend && 
            player.is_guild_member === is_guild_member) 
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