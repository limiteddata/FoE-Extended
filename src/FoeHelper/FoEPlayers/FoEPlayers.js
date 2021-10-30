import { FoERequest } from "../FoeRequest";
import { requestJSON } from "../Utils";
import { FoEProxy } from "../FoeProxy";
const EventEmitter = require("events");

class FoePlayers extends EventEmitter{  
    currentPlayer;
    protectedPlayers;
    constructor(){
        super();
        FoEProxy.addHandler('getData',(e)=> this.currentPlayer = e.user_data)
        FoEProxy.addHandler('getCityProtections',(e)=> this.protectedPlayers = e.map(player=>player.playerId))
    }
    async getFriendsList(){
        const request = requestJSON("OtherPlayerService","getFriendsList");
        const response = await FoERequest.FetchRequestAsync(request);
        return response.filter(player=>
            player.is_self === false &&
            player.is_guild_member === false);
    }
    async getClanMemberList(){
        const request = requestJSON("OtherPlayerService","getClanMemberList");
        const response = await FoERequest.FetchRequestAsync(request);
        return response.filter(player=> player.is_self === false);
    }
    async getNeighborList(){
        const request = requestJSON("OtherPlayerService","getNeighborList");
        let response = await FoERequest.FetchRequestAsync(request);
        return response.filter(player=>
            player.is_self === false && 
            player.is_friend === false && 
            player.is_guild_member === false) 
    }
    async getTavernSeats(){   
        const request = requestJSON("FriendsTavernService","getOwnTavern");
        const response = await FoERequest.FetchRequestAsync(request);

        const unlockedChairs = response.view.unlockedChairs;
        const occupiedSeats = response.view.visitors.length;

        return {"unlockedChairs":unlockedChairs,"occupiedSeats":occupiedSeats};
    }
    async visitPlayerCity(playerId){   
        const request = requestJSON("OtherPlayerService","visitPlayer",[playerId])  
        return await FoERequest.FetchRequestAsync(request);
    }
    async getResources(){
        const request = requestJSON("ResourceService","getPlayerResources")  
        return (await FoERequest.FetchRequestAsync(request))['resources'];
    }
}

const FoEPlayers = new FoePlayers();

export { FoEPlayers }