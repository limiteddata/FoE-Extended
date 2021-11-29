import { FoEconsole } from "../../Foeconsole/Foeconsole";
import { FoERequest } from "../../FoeRequest";
import { armyManagement } from "../../ArmyManagement/ArmyManagement";
import { requestJSON, wait } from "../../Utils";
import { FoEPlayers } from '../../FoEPlayers/FoEPlayers';
import { toast } from "react-toastify";
import { FoEAttack } from "../FoeAttack";
import { FoEProxy } from "../../FoeProxy";
import { gvgeras } from './gvgEras';


const EventEmitter = require("events");

class FoeGVG extends EventEmitter{  
    #autoAttackGVG = false;
    #proxy = null;
    get autoAttackGVG(){
        return this.#autoAttackGVG;
    }
    set autoAttackGVG(e){
        if(this.#autoAttackGVG === e) return;
        this.#autoAttackGVG = e;
        localStorage.setItem('autoAttackGVG', JSON.stringify(e));
        if(e){
            this.attackAllGVG();
            if(this.#proxy === null) this.#proxy = FoEProxy.addHandler('changeProvince',this.__proxyHandler__);
        }
        else FoEProxy.removeHandler(this.#proxy);
    }

    #autoDefendGVG = false;
    get autoDefendGVG(){
        return this.#autoDefendGVG;
    }
    set autoDefendGVG(e){
        if(this.#autoDefendGVG === e) return;
        this.#autoDefendGVG = e;
        localStorage.setItem('autoDefendGVG', JSON.stringify(e));
        if(e){
            this.defendAllGVG();
            if(this.#proxy === null) this.#proxy = FoEProxy.addHandler('changeProvince',this.__proxyHandler__);
        }
        else FoEProxy.removeHandler(this.#proxy);
    }

    constructor(){
        super();    
        const loadedautoAttackGVG = localStorage.getItem('autoAttackGVG');
        if(loadedautoAttackGVG && loadedautoAttackGVG != 'null')
            this.autoAttackGVG = JSON.parse(loadedautoAttackGVG);    
            
        const loadedautoDefendGVG = localStorage.getItem('autoDefendGVG');
        if(loadedautoDefendGVG && loadedautoDefendGVG != 'null')
            this.autoDefendGVG = JSON.parse(loadedautoDefendGVG);   

        
    }
    async getGVGOverview(era){
        if(!FoEPlayers.currentPlayer.clan_name || FoEPlayers.currentPlayer.clan_name === '') throw 'Player is not in a guild.'
        const request = requestJSON('ClanBattleService','getProvinceDetailed', [era]);
        const response = await FoERequest.FetchRequestAsync(request, {delay:0});
        return response;
    }
    async getSectorOverview(sectorId){
        if(!FoEPlayers.currentPlayer.clan_name || FoEPlayers.currentPlayer.clan_name === '') throw 'Player is not in a guild.'
        const request = requestJSON('ClanBattleService','getProvinceSectorDetailed', [sectorId]);
        const response = await FoERequest.FetchRequestAsync(request, {delay:100});
        return response;
    }
    async getAttackingSectors(era){
        const overview = await this.getGVGOverview(era);
        const clanId = overview.clan_data.clan.id;
        const sectors = overview.province_detailed.sectors;
        return sectors.filter(sector=> sector.siege_clan_id === clanId).map(sector=>sector.sector_id);
    }
    async getSigedSectors(era){
        const overview = await this.getGVGOverview(era);
        const clanId = overview.clan_data.clan.id;
        const sectors = overview.province_detailed.sectors;
        return sectors.filter(sector=> sector.owner_id === clanId && sector.siege_clan_id ).map(sector=>sector.sector_id);
    }
    __proxyHandler__ = async (e)=>{
        if(e.type === "ClanBattle\/siege_deployed"){
            if(this.autoDefendGVG === true && e.target_clan_id === FoEPlayers.currentPlayer.clan_id){
                FoEconsole.log('Need to defend gvg');
                await this.defendAllGVG();
            }
            if(this.autoAttackGVG === true && e.source_clan_id === FoEPlayers.currentPlayer.clan_id){
                FoEconsole.log('Need to attack gvg');
                await this.attackAllGVG();
            }
        }   
    }
    getEraofArmy(army){
        let eras = [];
        const unitTypes = armyManagement.armyTypes;
        for(const unit of army){
            if( unitTypes[unit.unitTypeId].minEra === "NoAge") continue;
            if(eras.indexOf(unitTypes[unit.unitTypeId].minEra) === -1) 
                eras.push(unitTypes[unit.unitTypeId].minEra);
            if(eras.length > 1) {
                FoEconsole.log(`Army contains multiple eras`);
                return null;
            }
        }
        if (gvgeras.indexOf(eras[0]) === -1) return null
        return eras[0];
    }

    async attackEra(era){
        await toast.promise(
            new Promise(async (resolve,reject)=>{
                try {

                    const sectors = await this.getAttackingSectors(era);
                    if (sectors.length==0){
                        resolve('No sectors to attack');
                        return;
                    } 
                    for (const sectorId of sectors){
                        FoEconsole.log(`GVG attacking sector id: ${sectorId} from era ${era}`);
                        const clanId = (await this.getSectorOverview(sectorId)).siege_clan_id;
                        const armyIndex = 0;
                        for (let i = 0; i < 80; i++) {
                            if(armyIndex > armyManagement.attackArmy.length-1) {
                                FoEconsole.log('Too many failed attack attempts');
                                resolve('Too many failed attack attempts');
                                return;
                            }
                            const sectorOverview =  await this.getSectorOverview(sectorId);     
                            if(sectorOverview.owner_id === clanId) break;
                            FoEconsole.log(`Hitpoints left: ${sectorOverview.hitpoints}`);
                            await armyManagement.setNewGVGArmy(era,armyIndex);
                            const attackResult = await FoEAttack.gvgAttack(sectorId);
                            if(attackResult === -1) armyIndex = 0;
                            else {
                                armyIndex++;
                                FoEconsole.log('Switching army type')
                            }
                        }
                        FoEconsole.log("Done attacking sector"); 
                    }
                    FoEconsole.log("Finished attacking gvg");
                    resolve('Finished attacking gvg');
                } catch (error) {
                    reject(error);
            }}),
            {
                pending: 'Attacking GVG...',
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

    async defendEra(era){
        await toast.promise(
            new Promise(async (resolve,reject)=>{
                try {
                    const sectors = await this.getSigedSectors(era);
                    if (sectors.length==0){
                        resolve('No sectors to defend');
                        return;
                    } 
                    for (const sectorId of sectors){
                        FoEconsole.log(`GVG defending sector id: ${sectorId} from era ${era}`);
                        const armyIndex = 0;
                        for (let i = 0; i < 80; i++) {
                            if(armyIndex > armyManagement.attackArmy.length-1){
                                FoEconsole.log('Too many failed attack attempts');
                                reject('Too many failed attack attempts');
                                return;
                            } 
                            const sectorOverview =  await this.getSectorOverview(sectorId);     
                            if(sectorOverview.siege_clan_id) break;
                            for (let p = 0; p < sectorOverview.siege_armies.length; p++) {
                                FoEconsole.log(`Hitpoints left: ${sectorOverview.siege_armies[p].hitpoints}`);
                            }
                            await armyManagement.setNewGVGArmy(era,armyIndex);
                            const attackResult = await FoEAttack.gvgAttack(sectorId, true);
                            if(attackResult === -1) armyIndex = 0;
                            else {
                                armyIndex++;
                                FoEconsole.log('Switching army type')
                            }
                        }
                        FoEconsole.log("Done defending sector"); 
                    }

                    FoEconsole.log("Finished deffending gvg");
                    resolve('Finished deffending gvg');
                } 
                catch (error) {
                    reject(error);
            }}),
            {
                pending: 'Defending GVG...',
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
    getGVGEras(){
        return armyManagement.gvgArmy.reduce((a,b)=>{
            if(a.indexOf(b.era) < 0) a.push(b.era)
            return a;
        }, [])
    }
    async attackAllGVG(){
        this.getGVGEras().forEach(era=>this.attackEra(era))
    }   
    async defendAllGVG(){
        this.getGVGEras().forEach(era=>this.defendEra(era))
    }     
}

const FoEGVG = new FoeGVG();

export { FoEGVG }