import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";

const EventEmitter = require("events");

class FoePlayers extends EventEmitter{  
    constructor(){
        super();
    }
    async getFriendsList(self=false){
        const request = [{"__class__":"ServerRequest","requestData":[],"requestClass":"OtherPlayerService","requestMethod":"getFriendsList"}];
        let response = await FoERequest.FetchRequestAsync(request,0);
        if(self!==true) response = response.filter(player=>player.is_self === false) 
        return response
    }
    async getClanMemberList(self=false){
        const request = [{"__class__":"ServerRequest","requestData":[],"requestClass":"OtherPlayerService","requestMethod":"getClanMemberList"}];
        let response = await FoERequest.FetchRequestAsync(request,0);
        if(self!==true) response = response.filter(player=>player.is_self === false)
        return response
    }
    async getNeighborList(self=false){
        const request = [{"__class__":"ServerRequest","requestData":[],"requestClass":"OtherPlayerService","requestMethod":"getNeighborList"}];
        let response = await FoERequest.FetchRequestAsync(request,0);
        if(self!==true) response = response.filter(player=>player.is_self === false) 
        return response
    }
    async MotivatePlayers(playerList){
        for (const player of playerList){
            if(player['next_interaction_in'] || player['accepted'] === false) continue;
            FoEconsole.console(`Motivating player: ${player.name}`);
            const request = [{"__class__":"ServerRequest","requestData":[player.player_id],"requestClass":"OtherPlayerService","requestMethod":"polivateRandomBuilding"}];
            await FoERequest.FetchRequestAsync(request)
        }   
        FoEconsole.console(`Finished motivating.`);
    }
    async MotivateClanMembers(){
        FoEconsole.console(`Started motivating clan members.`);
        await this.MotivatePlayers(await this.getClanMemberList());
    }
    async MotivateFriends(){
        FoEconsole.console(`Started motivating friends.`);
        await this.MotivatePlayers(await this.getFriendsList());
    }
    async MotivateNeighbors(){
        FoEconsole.console(`Started motivating neighbor.`);
        await this.MotivatePlayers(await this.getNeighborList());
    }
    async CollectTavern(){
        const request = [{"__class__":"ServerRequest","requestData":[],"requestClass":"FriendsTavernService","requestMethod":"collectReward"}];
        await FoERequest.FetchRequestAsync(request,0);
        FoEconsole.console("Tavern collected");
    }
    async seatToTavern(playerid){
        const getTavernrequest = [{"__class__":"ServerRequest","requestData":[playerid],"requestClass":"FriendsTavernService","requestMethod":"getOtherTavernState"}]
        const tavernsData = await FoERequest.FetchRequestAsync(getTavernrequest,100);
        if(tavernsData.unlockedChairCount != tavernsData.sittingPlayerCount && 
            ["notFriend", "noChair", "isSitting", "noChair", "alreadyVisited"].indexOf(tavernsData["state"]) === -1 ){  
                FoEconsole.console(`Sitting down at ${tavernsData.ownerId}`);                                         
                const sitRequest = [{"__class__":"ServerRequest","requestData":[tavernsData.ownerId],"requestClass":"FriendsTavernService","requestMethod":"getOtherTavern"}];
                await FoERequest.FetchRequestAsync(sitRequest,100);                               
        }
    }
    async seatToTavernsMain(){
        FoEconsole.console(`Started seating to taverns.`);
        const friendsList = await this.getFriendsList();
        for(const player of friendsList) await this.seatToTavern(player.player_id)
        FoEconsole.console(`Finished seating to taverns.`);
    }
}

const FoEPlayers = new FoePlayers();

export { FoEPlayers }