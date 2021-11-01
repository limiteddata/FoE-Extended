import { FoEconsole } from "../../Foeconsole/Foeconsole";
import { FoERequest } from "../../FoeRequest";
import { armyManagement } from "../../ArmyManagement/ArmyManagement";
import { requestJSON, wait } from "../../Utils";
import { FoEPlayers } from '../../FoEPlayers/FoEPlayers';
import { toast } from "react-toastify";
import { FoEAttack } from "../FoeAttack";
import { FoEProxy } from "../../FoeProxy";
import { sectors } from "./map1Sectors";
const EventEmitter = require("events");

class FoeGBG extends EventEmitter{  
    #numAttacks=130;
    get numAttacks(){
        return this.#numAttacks;
    }
    set numAttacks(e){
        if(this.#numAttacks === e) return;
        this.#numAttacks = e;
        localStorage.setItem('numAttacks', JSON.stringify(e));
        this.emit('numAttacks', this.numAttacks);
    }

    constructor(){
        super();    
        const loadednumAttacks = localStorage.getItem('numAttacks');
        if(loadednumAttacks && loadednumAttacks != 'null')
            this.numAttacks = JSON.parse(loadednumAttacks);    
    }
    
    async getBattleground(){ 
        const request = requestJSON('GuildBattlegroundService','getBattleground');
        const response = await FoERequest.FetchRequestAsync(request, {delay:0});
        return response;
    }
    async getCLGState(){ 
        const request = requestJSON('GuildBattlegroundStateService','getState');
        const response = await FoERequest.FetchRequestAsync(request, {delay:0});
        return response;
    }
    async isGuildParticipating(){ 
        return (await this.getCLGState())["stateId"];
    }
    checkForNeighbors( overview, sectorname ){
        const provinces = overview.map.provinces;
        const nbs = sectors[sectorname].neighbors;
        for(const province of provinces)
            for (const nb of nbs){
                if( province.id === sectors[nb].sectorId && 
                    province.ownerId === overview.currentParticipantId)
                    return true;
            }
        return false;
    }
    async checkSector(sectorName){ 
        const sectorid = sectors[sectorName].sectorId;
        const overview = await this.getBattleground();
        const provinces = overview.map.provinces;

        for(const province of provinces){
            if(province.id !== sectorid) continue;
            if(province.lockedUntil) return false;
            for(const progress of province.conquestProgress){
                if(progress.participantId !== overview.currentParticipantId) continue;
                if(progress.maxProgress > progress.progress) return true;
            }
        }
        return false;
    }
    async attackGBG(sectorName){
        const sectorId = sectors[sectorName].sectorId;
        await toast.promise(
            new Promise(async (resolve,reject)=>{
                try {
                    // check if sector can be attacked
                    if(await this.isGuildParticipating() !== "participating") reject("guild is not participating"); 
                    const overview = await this.getBattleground(); 
                    if(!this.checkForNeighbors(overview,sectorName)) {
                        reject(`Can't reach sector ${sectorName}`);
                        return;
                    }
                    if(!await this.checkSector(sectorName)) {
                        reject(`Unable to attack ${sectorName}`);
                        return
                    }
                    let armyIndex = 0;   
                    FoEconsole.log(`Attacking ${sectorName} ${this.numAttacks} times`);
                    for (let i = 0; i < this.numAttacks; i++) {
                        if(!this.checkSector(sectorName)) break;
                        if(armyIndex > armyManagement.attackArmy.length-1) reject('Too many failed attack attempts');
                        await armyManagement.setNewAttackArmy(armyIndex);
                        const attackResult = await FoEAttack.gbgAttack(sectorId);
                        if(attackResult === -1) armyIndex = 0;
                        else {
                            armyIndex++;
                            FoEconsole.log('Switching army type')
                        }
                    }
                    FoEconsole.log(`Done attacking marked sector ${sectorName}`);


                    resolve(`Done attacking marked sector ${sectorName}`);
                } catch (error) {
                    reject(error);
            }}),
            {
                pending: `Attacking GBG sector ${sectorName}...`,
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
    }
    
}

const FoEGBG = new FoeGBG();

export { FoEGBG }