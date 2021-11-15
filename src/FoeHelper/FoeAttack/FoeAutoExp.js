import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { armyManagement } from "../ArmyManagement/ArmyManagement";
import { requestJSON, wait } from "../Utils";
import { FoEPlayers } from '../FoEPlayers/FoEPlayers';
import { toast } from "react-toastify";
import { FoEAttack } from "./FoeAttack";
import { FoEProxy } from "../FoeProxy";
const EventEmitter = require("events");

class FoeAutoExp extends EventEmitter{  
    #autoExpedition=false;
    #checking=false;
/*
    "autoRefill": {
        "interval": 3600,
        "refillAmount": 1,
        "maxAmount": 8,
        "type": "autoRefill",
        "__class__": "ResourceAutoRefillAbility"
    }
*/
    get autoExpedition(){
        return this.#autoExpedition;
    }
    set autoExpedition(e){
        if(this.#autoExpedition === e) return;
        this.#autoExpedition = e;
        localStorage.setItem('autoExpedition', JSON.stringify(e));
        this.emit('autoExpeditionChanged', this.autoExpedition);
        if(e) this.checkExpedition();
    }

    constructor(){
        super();    
        const loadedautoExpedition = localStorage.getItem('autoExpedition');
        if(loadedautoExpedition && loadedautoExpedition != 'null')
            this.autoExpedition = JSON.parse(loadedautoExpedition);    
        
    }
    async checkifMapUnlocked(currentMap){
        const request = requestJSON("GuildExpeditionService","getDifficulties")  
        const response = await FoERequest.FetchRequestAsync(request);
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
    async colectAllRewards(){
        const request = requestJSON("HiddenRewardService","getOverview")  
        const response = await FoERequest.FetchRequestAsync(request);
        response.hiddenRewards.forEach(async reward=>{
            const request = requestJSON("HiddenRewardService","collectReward",[reward.hiddenRewardId])  
            await FoERequest.FetchRequestAsync(request);
        })
    }
    async loopExp(num){
        let armyIndex = 0;   
        for(let i=0; i<num; i++){
            if(armyIndex > armyManagement.attackArmy.length-1) {
                FoEconsole.log('Too many failed attack attempts');
                this.autoExpedition = false;
                return -1;
            }
            let overview = await this.getExpeditionOverview();
            if(!overview['progress'].hasOwnProperty('currentEntityId')) overview['progress']['currentEntityId'] = 0;
            if(!overview['progress'].hasOwnProperty('difficulty')) overview['progress']['difficulty'] = 0;  
            if(overview['progress']['isMapCompleted'] === true ){      
                if (overview.progress.difficulty === 3){
                    FoEconsole.log(`Expedition finished`);
                    return -1;
                }
                if(await this.checkifMapUnlocked(overview.progress.difficulty)){
                    FoEconsole.log(`Map ${overview.progress.difficulty} compleated`);
                    await this.colectAllRewards();  
                    const request = requestJSON("GuildExpeditionService","changeDifficulty",[overview.progress.difficulty+1])  
                    await FoERequest.FetchRequestAsync(request);
                    FoEconsole.log("Map changed");
                    overview = await this.getExpeditionOverview();
                }else{
                    FoEconsole.log(`Map ${overview.progress.difficulty+1} is not unlocked!`);
                    return -1;
                }
            }

            // first check if expedition needs to open chest
            for (let i = 0; i < overview.chests.length; i++) {
                if(overview.chests[i].id === overview.progress.currentEntityId){
                    await this.openExpeditionChest(overview.progress.currentEntityId);
                    break;
                }
            }
            await armyManagement.setNewAttackArmy(armyIndex);
            const attackResult = await FoEAttack.expeditionAttack(overview.progress.currentEntityId);
            if(attackResult === -1) {
                await this.openExpeditionChest(overview['progress']['currentEntityId']+1);
                armyIndex = 0;
            }
            else {
                armyIndex++;
                FoEconsole.log('Switching army type')
            }
            await this.colectAllRewards();
        }
    }
    async checkExpedition(){
        if(this.#checking===true) return;
        this.#checking = true;
        await toast.promise(
            new Promise(async (resolve,reject)=>{
                try {
                    FoEconsole.log("Starting to attack in expedition");   
                    let overview = await this.getExpeditionOverview();
                    if(overview.state === 'inactive' && overview.isPlayerParticipating && overview.isGuildParticipating) {
                        resolve('Not participating to expedition');
                        return;
                    }
                    let attempts = (await FoEPlayers.getResources()).guild_expedition_attempt; 
                    if(attempts === 0){  
                        FoEconsole.log('Not enough attempts');
                        resolve('Not enough attempts');
                        return;
                    }
                    while(attempts>0){
                        if(await this.loopExp(attempts) === -1) {
                            resolve('Used all attempts');
                            return;
                        }
                        attempts = (await FoEPlayers.getResources()).guild_expedition_attempt; 
                    }
                    FoEconsole.log('Used all attempts');
                    resolve('Finished solving expedition');
                } catch (error) {
                    reject(error);
            }}),
            {
                pending: 'Solving guild expedition...',
                success: {
                    render({data}){
                        return `${data}`;
                    }
                },
                error: {
                render({data}){
                    return `${data}`
                }
            }
        })  
        this.#checking = false; 
    }
    
}

const FoEAutoExp = new FoeAutoExp();

export { FoEAutoExp }