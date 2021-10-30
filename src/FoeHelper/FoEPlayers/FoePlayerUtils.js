import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { FoEPlayers } from "./FoEPlayers";
import { requestJSON } from "../Utils";
import { toast } from 'react-toastify';

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
        await toast.promise(this.MotivatePlayers(await FoEPlayers.getClanMemberList()),
        {
            pending: 'Motivating clan members...',
            success: 'Finished motivating clan members.',
            error: 'Error while motivating clan members.'
        })
    }
    async MotivateFriends(){
        FoEconsole.log(`Started motivating friends.`);
        await toast.promise(this.MotivatePlayers(await FoEPlayers.getFriendsList()),
            {
                pending: 'Motivating friends...',
                success: 'Finished motivating friends.',
                error: 'Error while motivating friends.'
            })
    }
    async MotivateNeighbors(){
        FoEconsole.log(`Started motivating neighbors.`);
        await toast.promise(this.MotivatePlayers(await FoEPlayers.getNeighborList()),
        {
            pending: 'Motivating neighbors...',
            success: 'Finished motivating neighbors.',
            error: 'Error while motivating neighbors.'
        })
    }
    async CollectTavern(){
        FoEconsole.log("Collecting tavern");
        const tavernSeats = await FoEPlayers.getTavernSeats();
        if(tavernSeats["unlockedChairs"] !== tavernSeats["occupiedSeats"]) {
            FoEconsole.log("Tavern is not fully occupied yet");
            toast('Tavern is not fully occupied yet',{autoClose: 2000});
            return;
        }
        const request = requestJSON("FriendsTavernService","collectReward");

        await toast.promise(FoERequest.FetchRequestAsync(request),
        {
            pending: 'Collecting tavern...',
            success: 'Tavern collected.',
            error: 'Error while collecting tavern.'
        })

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
        await toast.promise(
            new Promise(async (resolve,reject)=>{
                const friendsList = await FoEPlayers.getFriendsList();
                for(const player of friendsList) await this.seatToTavern(player.player_id)
                resolve()
            }),
        {
            pending: 'Seating to taverns...',
            success: 'Finished seating to taverns.',
            error: 'Error while seating to taverns.'
        })
        FoEconsole.log(`Finished seating to taverns.`);
    }
    async removePlayer(player){   
        const request = requestJSON("FriendService","deleteFriend",[player.player_id]);
        await FoERequest.FetchRequestAsync(request);
        FoEconsole.log(`Removed inactive player ${player.name}`);
    }
    async removeInactivePlayers(){   
        FoEconsole.log(`Started removing inactive players`);
        await toast.promise(
            new Promise(async (resolve,reject)=>{
                let playerList = await FoEPlayers.getFriendsList();
                for(const player of playerList){
                    if (player.is_active === false) 
                        await this.removePlayer(player)
                }
                resolve();
            }),
            {
            pending: 'Removing inactive friends...',
            success: 'Finished removing friends.',
            error: 'Error while removing friends.'})
        FoEconsole.log('Done')    
    }
}

const FoEPlayerUtils = new FoePlayerUtils();

export { FoEPlayerUtils }