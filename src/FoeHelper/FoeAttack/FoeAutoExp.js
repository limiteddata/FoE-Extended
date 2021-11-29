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
    armyIndex=0;
    #autoExpedition=false;
    #checking=false;
    expeditionStarted = false;
    // seconds
    refillInterval = 3600;
    timeOffset = 2;

    get autoExpedition(){
        return this.#autoExpedition;
    }
    set autoExpedition(e){
        if(this.#autoExpedition === e) return;
        this.#autoExpedition = e;
        localStorage.setItem('autoExpedition', JSON.stringify(e));
        this.emit('autoExpeditionChanged', this.autoExpedition);
        if(e && this.#checking === false) this.checkExpedition();
    }
    #expAttempt=0;
    get expAttempt(){
        return this.#expAttempt;
    }
    set expAttempt(e){
        if(this.#expAttempt === e || e < 0 || e > 8) return;
        this.#expAttempt = e; 
        if(this.#expAttempt>0 && this.autoExpedition && this.#checking === false) this.checkExpedition();
    }
    constructor(){
        super();
        // add if expedition active check
        this.getOverview(0).then((overview)=>{
            if(overview.state === 'active' && overview.isPlayerParticipating && overview.isGuildParticipating )
                this.expeditionStarted = (overview.progress.isMapCompleted !== true && overview.progress.difficulty !== 3);
            else{
                // if expedition is inactive set a timeout until the next change
                const nextExpeditionAt = ((overview.nextStateTime + this.timeOffset) * 1000) - Date.now();
                setTimeout(()=>{
                    expeditionStarted = true;
                    this.checkExpedition();
                },nextExpeditionAt);
            }
            const loadedautoExpedition = localStorage.getItem('autoExpedition');
            if(loadedautoExpedition && loadedautoExpedition != 'null')
            this.autoExpedition = JSON.parse(loadedautoExpedition); 
        });
        // increment expedition attempts
        FoEProxy.addHandler('ResourceService', 'getPlayerAutoRefills',(e)=>{
            const nextRefillAt = ((e.resources.guild_expedition_attempt + this.refillInterval + this.timeOffset) * 1000) - Date.now();
            setTimeout(()=>{
                this.expAttempt++;
                setInterval(()=>{
                    this.expAttempt++
                }, (this.refillInterval+this.timeOffset) * 1000);
            },nextRefillAt);
        });
        FoEPlayers.on('playerResources',(e)=>this.expAttempt = e.guild_expedition_attempt);
    }
    async checkExpedition(){
        if(this.#checking===true || this.expeditionStarted === false) return;
        this.#checking = true;
        await wait(this.timeOffset * 1000);
        await toast.promise(
            new Promise(async (resolve,reject)=>{
                try {
                    FoEconsole.log("Starting to solve expedition");   
                    if(this.expAttempt === 0){  
                        FoEconsole.log('Not enough attempts');
                        resolve('Not enough attempts');
                        return;
                    }
                    while(this.expAttempt>0 && this.autoExpedition){
                        FoEconsole.log(`Attempt: ${this.expAttempt}`);
                        // check if the trying attempt was exceeded
                        if(this.armyIndex > armyManagement.attackArmy.length-1) {
                            FoEconsole.log('Too many failed attack attempts');
                            reject('Too many failed attack attempts');
                            this.autoExpedition = false;
                            return;
                        }
                        let overview = await this.getOverview();
                        // check expedition completeness
                        if(overview.progress.isMapCompleted === true ){      
                            // if the last difficulty is compleated then expedition finished
                            if (overview.progress.difficulty === 3){
                                FoEconsole.log(`Expedition finished`);
                                this.expeditionStarted = false;
                                resolve(`Expedition is finished`);
                                return;
                            }
                            // else check if the next map is unlocked and change the map 
                            if(await this.checkifMapUnlocked(overview.progress.difficulty+1)){
                                FoEconsole.log(`Map ${overview.progress.difficulty} compleated`);
                                await this.colectAllRewards();  
                                await this.changetoNextMap(overview.progress.difficulty+1);
                                overview = await this.getOverview();
                            }else{
                                FoEconsole.log(`Map ${overview.progress.difficulty+1} is not unlocked!`);
                                reject(`Map ${overview.progress.difficulty+1} is not unlocked!`);
                                return;
                            }
                        }
                        
                        // check if player is currently on a chest
                        for (let i = 0; i < overview.chests.length; i++) 
                            if(overview.progress.currentEntityId === overview.chests[i].id){
                                await this.openExpeditionChest(overview.progress.currentEntityId);
                                overview.progress.currentEntityId++;
                            }
                        await armyManagement.setNewAttackArmy(this.armyIndex);
                        const attackResult = await FoEAttack.expeditionAttack(overview.progress.currentEntityId);
                        if(attackResult === -1) {
                            await this.openExpeditionChest(overview['progress']['currentEntityId']+1);
                            this.armyIndex = 0;
                        }
                        else {
                            this.armyIndex++;
                            FoEconsole.log('Switching army type');
                        }
                        await this.colectAllRewards();
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
    async getOverview(delay = 400){
        const request = requestJSON("GuildExpeditionService","getOverview")  
        const response = await FoERequest.FetchRequestAsync(request, {delay:delay});
        if(response.state === 'active' && !response.progress.hasOwnProperty('currentEntityId')) response.progress['currentEntityId'] = 0;
        if(response.state === 'active' && !response.progress.hasOwnProperty('difficulty')) response.progress['difficulty'] = 0;
        return response;
    }
    async changetoNextMap(nextmap){
        const request = requestJSON("GuildExpeditionService","changeDifficulty",[nextmap])  
        await FoERequest.FetchRequestAsync(request);
        FoEconsole.log("Map changed");
    }
    async checkifMapUnlocked(mapindex){
        const request = requestJSON("GuildExpeditionService","getDifficulties")  
        const response = await FoERequest.FetchRequestAsync(request);
        return response[mapindex].unlocked;
    }
    async colectAllRewards(){
        const request = requestJSON("HiddenRewardService","getOverview")  
        const response = await FoERequest.FetchRequestAsync(request);
        response.hiddenRewards.forEach(async reward=>{
            const request = requestJSON("HiddenRewardService","collectReward",[reward.hiddenRewardId])  
            await FoERequest.FetchRequestAsync(request);
        })
    }
    async openExpeditionChest(id){
        const request = requestJSON("GuildExpeditionService","openChest",[id])  
        const response = await FoERequest.FetchRequestAsync(request);
        FoEconsole.log(`Opened chest. Reward: ${response.name}`);
    }
}

const FoEAutoExp = new FoeAutoExp();

export { FoEAutoExp }