import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { armyManagement } from "../ArmyManagement/ArmyManagement";
import { requestJSON } from "../Utils";
import { FoEPlayers } from '../FoEPlayers/FoEPlayers';
import { getResponseMethod } from "../Utils";
import { toast } from "react-toastify";
import { FoEAttack } from "./FoeAttack";

const EventEmitter = require("events");

class FoeAutoExp extends EventEmitter{  
    #autoExpedition=false;
    get autoExpedition(){
        return this.#autoExpedition;
    }
    set autoExpedition(e){
        if(this.#autoExpedition === e) return;
        this.#autoExpedition = e;
        localStorage.setItem('autoExpedition', JSON.stringify(e));
        if(e) setTimeout(this.checkExpedition,1000); 
    }

    constructor(){
        super();    
        const loadedautoExpedition = localStorage.getItem('autoExpedition');
        if(loadedautoExpedition && loadedautoExpedition != 'null')
            this.autoExpedition = JSON.parse(loadedautoExpedition);        
    }
    async checkifMapUnlocked(currentMap){
        const request = requestJSON("GuildExpeditionService","getDifficulties")  
        const response = await FoERequest.FetchRequestAsync(request,0);
        for(const map of response){
            if (map.id === currentMap+1) 
                return map.unlocked;
        }
        return false;
    }
    async openExpeditionChest(id){
        const request = requestJSON("GuildExpeditionService","openChest",[id])  
        const response = await FoERequest.FetchRequestAsync(request);
        FoEconsole.log(`Opened chest. Reward: ${response.name}`);
    }

    async getExpeditionOverview(){
        const request = requestJSON("GuildExpeditionService","getOverview")  
        const response = await FoERequest.FetchRequestAsync(request);
        return response;
    }

    async checkExpedition(){
        const attempts = FoEPlayers.playerResources.guild_expedition_attempt; 
        if(attempts === 0){  
            FoEconsole.log('Not enough attempts');
            return;
        }
        FoEconsole.log("Starting to attack in expedition");       
        while(attempts>0){
            let overview = await this.getExpeditionOverview();
            if(!overview['progress'].hasOwnProperty('currentEntityId')) overview['progress']['currentEntityId'] = 0;
            if(!overview['progress'].hasOwnProperty('difficulty')) overview['progress']['difficulty'] = 0;  
            if(overview['progress']['isMapCompleted'] == true ){      
                if (overview.progress.difficulty === 3){
                    FoEconsole.log(`Expedition finished`);   
                    return;
                }
                if(await this.checkifMapUnlocked(overview.progress.difficulty)){
                    FoEconsole.log(`Map ${overview.progress.difficulty} compleated`);
                    await this.colectAllRewards();  
                    const request = requestJSON("GuildExpeditionService","changeDifficulty",[overview.progress.difficulty+1])  
                    await FoERequest.FetchRequestAsync(request);
                    FoEconsole.log("Map changed");
                    overview = await this.getExpeditionOverview();
                }
                FoEconsole.log(`Map ${overview.progress.difficulty+1} is not unlocked!`);
                return;
            }
            // from here 



            
            // first check if expedition needs to open chest
            for (let i = 0; i < overview['chests'].length; i++) {
                if(overview['chests'][i]['id'] == overview['progress']['currentEntityId']){
                    await openExpeditionChest(overview['progress']['currentEntityId']);
                    break;
                }
            }
            var result = await expedition_AttackSector(overview['progress']['currentEntityId']);
            if(result == 0) await openExpeditionChest(overview['progress']['currentEntityId']+1);// open chest
            else if(result == 1) return {'finished':false,'lost':1};
            else if(result["noarmy"] == true) return {"noarmy":true};
            this.colectAllRewards();
        }
        FoEconsole.log('Used all attempts');
    }
    
}

const FoEAutoExp = new FoeAutoExp();

export { FoEAutoExp }