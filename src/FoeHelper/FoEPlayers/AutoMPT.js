import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { FoEProxy } from "../FoeProxy";
import { FoEPlayers } from "./FoEPlayers";
import { getResponseMethod, requestJSON } from "../Utils";
import { toast } from 'react-toastify';
import { timer } from "../GlobalTimer";

const EventEmitter = require("events");

class FoeAutoMPT extends EventEmitter{  
    #autoMotivateNeighbors=false;
    #handlersNeighbors = [];
    get autoMotivateNeighbors(){
        return this.#autoMotivateNeighbors;
    }
    set autoMotivateNeighbors(e){
        if(this.#autoMotivateNeighbors === e) return;
        this.#autoMotivateNeighbors = e;
        localStorage.setItem('autoMotivateNeighbors', JSON.stringify(e));
        if(e){
            FoEconsole.log(`Auto motivate neighbors active`);
            this.MotivateNeighbors().then(updatedPlayers=>{
                updatedPlayers.forEach(player => {
                    this.#handlersNeighbors.push(
                        timer.addHandlerIn(`motivate:${player.name}`, player.next_interaction_in,async ()=>{
                            const newMotivate = await this.MotivatePlayer(player.player_id);
                            timer.updateHandler(`motivate:${player.name}`, newMotivate.next_interaction_in);
                        }, false)
                    );
                });
            });
        }
        else{
            timer.removeHandlers(this.#handlersNeighbors);
            this.#handlersNeighbors = [];
        }
    }

    #handlersClanMembers = [];
    #autoMotivateClanMembers=false;
    get autoMotivateClanMembers(){
        return this.#autoMotivateClanMembers;
    }
    set autoMotivateClanMembers(e){
        if(this.#autoMotivateClanMembers === e) return;
        this.#autoMotivateClanMembers = e;
        localStorage.setItem('autoMotivateClanMembers', JSON.stringify(e));
        if(e){
            FoEconsole.log(`Auto motivate clan members active`);
            this.MotivateClanMembers().then(updatedPlayers=>{
                updatedPlayers.forEach(player => {
                    this.#handlersClanMembers.push(
                        timer.addHandlerIn(`motivate:${player.name}`, player.next_interaction_in,async ()=>{
                            const newMotivate = await this.MotivatePlayer(player.player_id);
                            timer.updateHandler(`motivate:${player.name}`, newMotivate.next_interaction_in);
                        }, false)
                    );
                });
            });
        }
        else{
            timer.removeHandlers(this.#handlersClanMembers);
            this.#handlersClanMembers = [];
        }
    }

    #handlersFriends = [];
    #autoMotivateFriends=false;
    get autoMotivateFriends(){
        return this.#autoMotivateFriends;
    }
    set autoMotivateFriends(e){
        if(this.#autoMotivateFriends === e) return;
        this.#autoMotivateFriends = e;
        localStorage.setItem('autoMotivateFriends', JSON.stringify(e));
        if(e){
            FoEconsole.log(`Auto motivate friends active`);
            this.MotivateFriends().then(updatedPlayers=>{
                updatedPlayers.forEach(player => {
                    this.#handlersFriends.push(
                        timer.addHandlerIn(`motivate:${player.name}`, player.next_interaction_in,async ()=>{
                            const newMotivate = await this.MotivatePlayer(player.player_id);
                            timer.updateHandler(`motivate:${player.name}`, newMotivate.next_interaction_in);
                        }, false)
                    );
                });
            });
        }
        else{
            timer.removeHandlers(this.#handlersFriends);
            this.#handlersFriends = [];
        }
    }

    #autoTavern=false;
    #proxy;
    get autoTavern(){
        return this.#autoTavern;
    }
    set autoTavern(e){
        if(this.#autoTavern === e) return;
        this.#autoTavern = e;
        localStorage.setItem('autoTavern', JSON.stringify(e));
        if(e){
            FoEconsole.log(`Auto colect tavern active`)
            this.CollectTavern();
            this.seatToAllTaverns(); 
            this.#proxy = FoEProxy.addHandler('FriendsTavernService', 'getSittingPlayersCount',async (e)=>{
                if(e[2] !== e[1]) {
                    if(FoEPlayers.currentPlayer && e[0] === FoEPlayers.currentPlayer.player_id && e[2] === e[1]){
                        await this.CollectTavern();
                        return;
                    }
                    await this.seatToTavern(e[0]);
                }
            });  
        }
        else FoEProxy.removeHandler(this.#proxy);
    }
    constructor(){
        super();            
        const loadedautoMNeighbors = localStorage.getItem('autoMotivateNeighbors');
        if(loadedautoMNeighbors && loadedautoMNeighbors != 'null')
            this.autoMotivateNeighbors = JSON.parse(loadedautoMNeighbors);

        const loadedautoMCM = localStorage.getItem('autoMotivateClanMembers');
        if(loadedautoMCM && loadedautoMCM != 'null')
            this.autoMotivateClanMembers = JSON.parse(loadedautoMCM);

        const loadedautoMFriends = localStorage.getItem('autoMotivateFriends');
        if(loadedautoMFriends && loadedautoMFriends != 'null')
            this.autoMotivateFriends = JSON.parse(loadedautoMFriends);

        const loadedautoTavern = localStorage.getItem('autoTavern');
        if(loadedautoTavern && loadedautoTavern != 'null')
            this.autoTavern = JSON.parse(loadedautoTavern);

    }

    CheckPlayerList(playerList){
        return playerList.filter(player=> {
            if(!player.next_interaction_in) {
                if(player.accepted) return player.accepted === true;
                return true;
            }
            return false; 
        });
    }
    async MotivatePlayer(player_id){
        const request = requestJSON("OtherPlayerService","polivateRandomBuilding",[player_id]);
        const response = await FoERequest.FetchRequestAsync(request,{raw:true});
        return getResponseMethod(response,'updatePlayer')[0];
    }
    MotivatePlayers = async (playerList)=>{
        let updatedPlayers = [];
        for (const player of playerList){
            FoEconsole.log(`Motivating player: ${player.name}`);
            const updatedPlayer = await this.MotivatePlayer(player.player_id);
            updatedPlayers.push(updatedPlayer);
        }
        FoEconsole.log(`Finished motivating players.`);
        return updatedPlayers;
    }
    MotivateClanMembers = async ()=>{ 
        return await toast.promise(async()=> {
            const ClanMemberList = await FoEPlayers.getClanMemberList();
            const players = this.CheckPlayerList(ClanMemberList);
            if(players.length === 0) {
                FoEconsole.log('No clan members to motivate');
                return ClanMemberList;
            }
            FoEconsole.log(`Started motivating clan members.`);
            return await this.MotivatePlayers(players);
        },
        {
            pending: 'Motivating clan members...',
            success: 'Finished motivating clan members.',
            error: 'Error while motivating clan members.'
        });
    }
    MotivateFriends = async()=>{  
        return await toast.promise(async()=> {
            const friendsList = await FoEPlayers.getFriendsList();
            const players = this.CheckPlayerList(friendsList);
            if(players.length === 0) {
                FoEconsole.log('No friends to motivate');
                return friendsList;
            }
            FoEconsole.log(`Started motivating friends.`);
            return await this.MotivatePlayers(players);
        },
        {
            pending: 'Motivating friends...',
            success: 'Finished motivating friends.',
            error: 'Error while motivating friends.'
        });
    }
    MotivateNeighbors = async ()=>{
        return await toast.promise(async()=> {
            const neighborsList = await FoEPlayers.getNeighborList();
            const players = this.CheckPlayerList(neighborsList);
            if(players.length === 0) {
                FoEconsole.log('No neighbors to motivate');
                return neighborsList;
            }
            FoEconsole.log(`Started motivating neighbors.`);
            return await this.MotivatePlayers(players);
        },
        {
            pending: 'Motivating neighbors...',
            success: 'Finished motivating neighbors.',
            error: 'Error while motivating neighbors.'
        });
    }
    async CollectTavern(){
        const tavernSeats = await FoEPlayers.getTavernSeats();
        if(tavernSeats["unlockedChairs"] !== tavernSeats["occupiedSeats"]) {
            FoEconsole.log("Tavern is not fully occupied yet");
            return;
        }
        FoEconsole.log("Collecting tavern");
        const request = requestJSON("FriendsTavernService","collectReward");
        await toast.promise(FoERequest.FetchRequestAsync(request),
        {
            pending: 'Collecting tavern...',
            success: 'Tavern collected.',
            error: 'Error while collecting tavern.'
        })

        FoEconsole.log("Tavern collected");
    }
    async seatToPlayerTavern(playerid){
        FoEconsole.log(`Sitting down at ${playerid}`);      
        const sitRequest = requestJSON("FriendsTavernService","getOtherTavern",[playerid]);
        await FoERequest.FetchRequestAsync(sitRequest,{delay:100});     
    }
    seatToTavern = async (playerid)=>{
        const getTavernrequest = requestJSON("FriendsTavernService","getOtherTavernState",[playerid]);
        const tavernData = await FoERequest.FetchRequestAsync(getTavernrequest, {delay:100});
        if(tavernData.unlockedChairCount != tavernData.sittingPlayerCount && 
            ["notFriend", "newFriend", "noChair", "isSitting", "noChair", "alreadyVisited"].indexOf(tavernData["state"]) === -1 ) 
                this.seatToPlayerTavern(playerid);
    }
    async seatToTaverns(taverns){
        let request = [];
        for (const tavern of taverns){
            if(tavern.unlockedChairCount != tavern.sittingPlayerCount && 
                ["notFriend", "newFriend", "noChair", "isSitting", "noChair", "alreadyVisited"].indexOf(tavern["state"]) === -1 )
                    request.push(requestJSON("FriendsTavernService","getOtherTavern",[tavern.ownerId],true));
        }
        if(!request || request.length === 0) return;
        await FoERequest.FetchRequestAsync(request);
    }
    seatToAllTaverns = async ()=>{
        FoEconsole.log(`Started seating to taverns.`);
        await toast.promise(async ()=>{
                const friendsList = await FoEPlayers.getFriendsList();
                const request = friendsList.map(player=> requestJSON("FriendsTavernService","getOtherTavernState",[player.player_id],true));
                const response = await FoERequest.FetchRequestAsync(request); 
                await this.seatToTaverns(response);
            },
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
        toast.success(`Removed inactive player ${player.name}`);
    }
    removeInactivePlayers = async ()=>{   
        FoEconsole.log(`Started removing inactive players`);
        await toast.promise(async ()=>{
                let playerList = await FoEPlayers.getFriendsList();
                for(const player of playerList)
                    if (player.is_active === false) await this.removePlayer(player)
            },
            {
            pending: 'Removing inactive friends...',
            success: 'Finished removing friends.',
            error: 'Error while removing friends.'})
        FoEconsole.log('Done')    
    }
}

const FoEAutoMPT = new FoeAutoMPT();

export { FoEAutoMPT }