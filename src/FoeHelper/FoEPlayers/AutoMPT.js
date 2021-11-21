import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoEProxy } from "../FoeProxy";
import { FoERequest } from "../FoeRequest";
import { FoEPlayers } from "./FoEPlayers";
import { FoEPlayerUtils } from "./FoePlayerUtils";

const EventEmitter = require("events");

class FoeAutoMPT extends EventEmitter{  
    #autoMotivateNeighbors=false;
    get autoMotivateNeighbors(){
        return this.#autoMotivateNeighbors;
    }
    set autoMotivateNeighbors(e){
        if(this.#autoMotivateNeighbors === e) return;
        this.#autoMotivateNeighbors = e;
        localStorage.setItem('autoMotivateNeighbors', JSON.stringify(e));
        if(e){
            FoEconsole.log(`Auto motivate neighbors active`);
            FoEPlayerUtils.MotivateNeighbors();
        }
    }
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
            FoEPlayerUtils.MotivateClanMembers();
        }
    }

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
            FoEPlayerUtils.MotivateFriends();
        }
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
        
        FoEProxy.addHandler('getSittingPlayersCount',(e)=>{
            if(e[2] !== e[1]) {
                if(FoEPlayers.currentPlayer && e[0] === FoEPlayers.currentPlayer.player_id && e[2] === e[1]){
                    FoEPlayerUtils.CollectTavern();
                    return;
                }
                FoEPlayerUtils.seatToTavern(e[0]);
            }
        });
    }
}

const FoEAutoMPT = new FoeAutoMPT();

export { FoEAutoMPT }