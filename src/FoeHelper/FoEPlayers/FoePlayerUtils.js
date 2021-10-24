import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { FoEPlayers } from "./FoEPlayers";
import { requestJSON } from "../Utils";
const EventEmitter = require("events");

class FoePlayerUtils extends EventEmitter{  
    constructor(){
        super();
    }
    async MotivatePlayers(playerList){
        for (const player of playerList){
            if(player['next_interaction_in'] || player['accepted'] === false) continue;
            FoEconsole.log(`Motivating player: ${player.name}`);
            const request = requestJSON("OtherPlayerService","polivateRandomBuilding",[player.player_id]);
            await FoERequest.FetchRequestAsync(request)
        }   
        FoEconsole.log(`Finished motivating players.`);
    }
    async MotivateClanMembers(){
        FoEconsole.log(`Started motivating clan members.`);
        await this.MotivatePlayers(await FoEPlayers.getClanMemberList());
    }
    async MotivateFriends(){
        FoEconsole.log(`Started motivating friends.`);
        await this.MotivatePlayers(await FoEPlayers.getFriendsList());
    }
    async MotivateNeighbors(){
        FoEconsole.log(`Started motivating neighbor.`);
        await this.MotivatePlayers(await FoEPlayers.getNeighborList());
    }
    async CollectTavern(){
        FoEconsole.log("Collecting tavern");
        const tavernSeats = await FoEPlayers.getTavernSeats();
        if(tavernSeats["unlockedChairs"] !== tavernSeats["occupiedSeats"]) {
            FoEconsole.log("Tavern is not fully occupied yet");
            return;
        }
        const request = requestJSON("FriendsTavernService","requestMethod");
        await FoERequest.FetchRequestAsync(request,0);
        FoEconsole.log("Tavern collected");
    }
    async seatToTavern(playerid){
        const getTavernrequest = requestJSON("FriendsTavernService","getOtherTavernState",[playerid]);
        const tavernsData = await FoERequest.FetchRequestAsync(getTavernrequest,100);
        if(tavernsData.unlockedChairCount != tavernsData.sittingPlayerCount && 
            ["notFriend", "noChair", "isSitting", "noChair", "alreadyVisited"].indexOf(tavernsData["state"]) === -1 ){  
                FoEconsole.log(`Sitting down at ${tavernsData.ownerId}`);      
                const sitRequest = requestJSON("FriendsTavernService","getOtherTavern",[playerid]);
                await FoERequest.FetchRequestAsync(sitRequest,100);                               
        }
    }
    async seatToAllTaverns(){
        FoEconsole.log(`Started seating to taverns.`);
        const friendsList = await FoEPlayers.getFriendsList();
        for(const player of friendsList) await this.seatToTavern(player.player_id)
        FoEconsole.log(`Finished seating to taverns.`);
    }
    async removePlayer(player){   
        const request = requestJSON("FriendService","deleteFriend",[player.player_id]);
        await FoERequest.FetchRequestAsync(request,0);
        FoEconsole.log(`Removed inactive player ${player.name}`);
    }
    async removeInactivePlayers(){   
        FoEconsole.log(`Started removing inactive players`);
        let playerList = await FoEPlayers.getFriendsList();
        for(const player of playerList){
            if (player.is_active === false) 
                await this.removePlayer(player)
        }
        FoEconsole.log('Done')    
    }
}

const FoEPlayerUtils = new FoePlayerUtils();

export { FoEPlayerUtils }