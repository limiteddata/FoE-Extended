import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoEProxy } from "../FoeProxy";
import { FoERequest } from "../FoeRequest";
import { FoEPlayers } from "./FoEPlayers";
import { FoEPlayerUtils } from "./FoePlayerUtils";

const EventEmitter = require("events");

class FoeAutoMPT extends EventEmitter{  
    #autoMotivateNeighbors=false;
    #intervalMNeighbors=null;
    get autoMotivateNeighbors(){
        return this.#autoMotivateNeighbors;
    }
    set autoMotivateNeighbors(e){
        if(this.#autoMotivateNeighbors === e) return;
        this.#autoMotivateNeighbors = e;
        localStorage.setItem('autoMotivateNeighbors', JSON.stringify(e));
        if(e){
            FoEconsole.log(`Auto motivate neighbors active`);
            (async ()=>{
                await FoEPlayerUtils.MotivateNeighbors();
                // call after 24h+2min
                this.#intervalMNeighbors = setInterval(async () => await FoEPlayerUtils.MotivateNeighbors(), 86520000 );
            })();
        }
        else clearInterval(this.#intervalMNeighbors);
    }
    #intervalMCM=null;
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
            (async ()=>{
                await FoEPlayerUtils.MotivateClanMembers();
                // call after 24h+2min
                this.#intervalMCM = setInterval(async () => await FoEPlayerUtils.MotivateClanMembers(), 86520000 );
            })();
        }
        else clearInterval(this.#intervalMCM);
    }

    #autoMotivateFriends=false;
    #intervalMFriends=null;
    get autoMotivateFriends(){
        return this.#autoMotivateFriends;
    }
    set autoMotivateFriends(e){
        if(this.#autoMotivateFriends === e) return;
        this.#autoMotivateFriends = e;
        localStorage.setItem('autoMotivateFriends', JSON.stringify(e));
        if(e){
            FoEconsole.log(`Auto motivate friends active`);
            (async ()=>{
                await FoEPlayerUtils.MotivateFriends();
                // call after 24h+2min
                this.#intervalMFriends = setInterval(async () => await FoEPlayerUtils.MotivateFriends(), 86520000 );
            })();
        }
        else clearInterval(this.#intervalMFriends);
    }
    #autoTavern=false;
    get autoTavern(){
        return this.#autoTavern;
    }
    set autoTavern(e){
        if(this.#autoTavern === e) return;
        this.#autoTavern = e;
        localStorage.setItem('autoTavern', JSON.stringify(e));
        if(e){
            FoEconsole.log(`Auto colect tavern active`)
            FoEPlayerUtils.CollectTavern();
            FoEPlayerUtils.seatToAllTaverns();   
        }
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
        FoEProxy.addHandler('getSittingPlayersCount',async (e)=>{
            if(e[2] !== e[1]) {
                if(FoEPlayers.currentPlayer && e[0] === FoEPlayers.currentPlayer.player_id && e[2] === e[1]){
                    await FoEPlayerUtils.CollectTavern();
                    return;
                }
                await FoEPlayerUtils.seatToTavern(e[0]);
            }
        });
    }
}

const FoEAutoMPT = new FoeAutoMPT();

export { FoEAutoMPT }