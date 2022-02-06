import { FoERequest } from "../FoeRequest";
import { requestJSON } from "../Utils";
import { FoEProxy } from "../FoeProxy";
import { FoEconsole } from "../Foeconsole/Foeconsole";
import { toast } from "react-toastify";
import { FoEPlayers } from "../FoEPlayers/FoEPlayers";
import { GlobalTimer, timer } from "../GlobalTimer";
const EventEmitter = require("events");

class FoeCity extends EventEmitter{ 
    #timer = new GlobalTimer(false);
    entities = [];
    #manualBuildings = {};
    get manualBuildings(){
        return this.#manualBuildings;
    }
    set manualBuildings(e){
        if(this.#manualBuildings === e) return;
        this.#manualBuildings = e;
        localStorage.setItem('manualBuildings', JSON.stringify(e));
        this.emit('buildingsChanged',e)       
    }

    #defaultGoodsOption=1;
    get defaultGoodsOption(){
        return this.#defaultGoodsOption;
    }
    set defaultGoodsOption(e){
        if(this.#defaultGoodsOption === e) return;
        this.#defaultGoodsOption = Number(e);
        localStorage.setItem('defaultGoodsOption', JSON.stringify(e));
    }
    #defaultProductionOption=1;
    get defaultProductionOption(){
        return this.#defaultProductionOption;
    }
    set defaultProductionOption(e){
        if(this.#defaultProductionOption === e) return;
        this.#defaultProductionOption = Number(e);
        localStorage.setItem('defaultProductionOption', JSON.stringify(e));
    }
    #autoCollect=false;
    _finishedCollecting=false;
    get autoCollect(){
        return this.#autoCollect;
    }
    set autoCollect(e){
        if(this.#autoCollect === e) return;
        this.#autoCollect = e;
        localStorage.setItem('autoCollect', JSON.stringify(e));
        if(e) {
            this.#timer.start();
            setTimeout(async ()=>{
                await this.collectAndSetBuildings();
                this._finishedCollecting=true;
                this.updateEntities(this.entities);
            },2000)
        }
        else{
            this.#timer.stop();
            this.#timer.clearHandlers();
        }
    }
    
    constructor(){
        super();
        const loadedmanualBuildings = localStorage.getItem('manualBuildings');
        if(loadedmanualBuildings && loadedmanualBuildings != 'null')
            this.manualBuildings = JSON.parse(loadedmanualBuildings);

        FoEProxy.addHandler('StartupService', 'getData', e => this.entities=e.city_map.entities);
        FoEProxy.addHandler('CityProductionService', 'cancelProduction', e => this.updateEntities(e.updatedEntities));
        FoEProxy.addHandler('CityProductionService', 'startProduction', e => this.updateEntities(e.updatedEntities));
        FoEProxy.addHandler('CityProductionService', 'completeProduction', e => this.updateEntities([e]));
        FoEProxy.addHandler('CityMapService', 'placeBuilding', e => this.entities.push(e) );
        FoEProxy.addHandler('CityMapService', 'updateEntity', e => {
            const updatedBuildings = e.filter(building=> building.player_id === FoEPlayers.currentPlayer.player_id);
            if(updatedBuildings.length > 0) this.updateEntities(updatedBuildings)                 
        });

        const loadedGoodsOption = localStorage.getItem('defaultGoodsOption');
        if(loadedGoodsOption && loadedGoodsOption != 'null')
            this.defaultGoodsOption = JSON.parse(loadedGoodsOption);

        const loadedProductionOption = localStorage.getItem('defaultProductionOption');
        if(loadedProductionOption && loadedProductionOption != 'null')
            this.defaultProductionOption = JSON.parse(loadedProductionOption);

        const loadedautoCollect = localStorage.getItem('autoCollect');
        if(loadedautoCollect && loadedautoCollect != 'null')
            this.autoCollect = JSON.parse(loadedautoCollect);

    }
    updateEntities = (entities)=>{
        for (const entitie of entities) {
            if(entitie.player_id !== FoEPlayers.currentPlayer.player_id) continue;
            for (let i = 0; i < this.entities.length; i++) {
                if(this.entities[i].id === entitie.id) {
                    this.entities[i] = entitie;
                    break;
                }
            }            
        }
        if(this.autoCollect && this._finishedCollecting){
            for (const building of this.entities){
                // check if building is dom and check guild
                if(building.cityentity_id === "X_FutureEra_Landmark1" && building.bonus.amount === -1) continue;
                
                if(building.state.__class__ === "ProducingState" && building.state.next_state_transition_at){      
                    this.#timer.addHandlerAt(building.cityentity_id+building.id, building.state.next_state_transition_at, async ()=>{
                        await this.collectAndSetBuilding(building);
                        toast.success(`Collected and set ${building.cityentity_id}`);
                    } );
                    continue;
                }
                timer.removeHandler({key:building.cityentity_id+building.id});
            }     
        }
    }
    async getBuildings(){
        if(this.entities.length > 0) return this.entities;
        const request = requestJSON('StartupService','getData');
        const response = await FoERequest.FetchRequestAsync(request);
        this.entities = response.city_map.entities;
        return this.entities;
    }
    async collectAndSetBuilding(building){
        const collectedBuildings = await this.collectBuilding(building);
        if(collectedBuildings>0) await this.setProductionBuilding(building);
        return collectedBuildings;
    }
    async cancelProduction(){
        FoEconsole.log("Starting to cancel all the production buildings except of the priority list");
        const buildings = (await this.getBuildings()).filter(bds=>
            bds.state.__class__ === "ProducingState" && 
            (bds.type === "production" || bds.type === "goods"));
        for (const building of buildings){
            if(this.manualBuildings[building.id] && !this.manualBuildings[building.id].cancelable) continue;
            FoEconsole.log(`Canceling production for ${building.id}`);
            const request = requestJSON('CityProductionService','cancelProduction',[building.id])
            const response = await FoERequest.FetchRequestAsync(request);
            this.updateEntities(response.updatedEntities);
            
        }
        FoEconsole.log("Done");
    }
    async getColectableBuildings(){
        const buildings = await this.getBuildings();
        const nowTimestamp = Math.floor(Date.now() / 1000);
        return buildings.filter(building=> {
            // check if building is dom and check guild
            if(building.cityentity_id === "X_FutureEra_Landmark1" && building.bonus.amount === -1) return false;
            return building.state.__class__ === 'ProductionFinishedState'|| 
                building.state.__class__ === "PlunderedState" || 
                (building.state.__class__ === "ProducingState" && nowTimestamp >= building.state.next_state_transition_at)
        });
    }

    collectPlunderedBuilding = async (building_id)=>{
        const request = requestJSON('CityProductionService', 'removePlunderedProduction', [building_id]);
        const response = await FoERequest.FetchRequestAsync(request);  
        toast.success(`Removed plunder on building`);
        FoEconsole.log(`Removed plunder on building`);
        this.updateEntities(response.updatedEntities);
        return response.updatedEntities.length;
    }

    async collectBuilding(building){
        if(FoEPlayers.playerResources.strategy_points>=100) {
            FoEconsole.log(`Player has over 100 SP`);
            toast.error(`Player has over 100 SP`);
            throw 'Player has over 100 SP';
        }
        if(building.state.__class__ === "PlunderedState")
            return await this.collectPlunderedBuilding(building.id);
        const request = requestJSON('CityProductionService', 'pickupProduction', [[building.id]]);
        const response = await FoERequest.FetchRequestAsync(request);  
        FoEconsole.log(`Building ${building.cityentity_id} collected`);
        this.updateEntities(response.updatedEntities);
        return response.updatedEntities.length;
    }

    async collectAllBuildings(){
        if(FoEPlayers.playerResources.strategy_points>=100) {
            FoEconsole.log(`Player has over 100 SP`);
            throw 'Player has over 100 SP';
        }
        let buildings = await this.getColectableBuildings();
        // first remove all plundered buildings
        for (let i = 0; i < buildings.length; i++) {
            if(buildings[i].state.__class__ !== "PlunderedState") continue;
            await this.collectPlunderedBuilding(buildings[i].id);
            buildings.splice(i,1);
        }
        buildings = buildings.map(building=>building.id);
        if(buildings.length === 0) return;
        FoEconsole.log('Collecting all buildings');
        const request = requestJSON('CityProductionService', 'pickupProduction', [buildings]);
        const response = await FoERequest.FetchRequestAsync(request);  
        this.updateEntities(response.updatedEntities);
        FoEconsole.log("All buildings collected");
    }
    async getIdleBuildings(){
        const buildings = await this.getBuildings();
        return buildings.filter(building=> 
            building.state.__class__ === 'IdleState'&& 
            (building.type === "production" ||  building.type === "goods"));
    }
    async setProductionBuilding(building){
        let prodOption = 1;
        if(building.type === "production") prodOption = this.defaultProductionOption;
        else if(building.type === "goods") prodOption = this.defaultGoodsOption;
        else return; // return because building cant be set
        if(this.manualBuildings[building.id]) prodOption = this.manualBuildings[building.id].option;
        if(building.type === "goods" && prodOption > 4 ) prodOption = 4;
        const request = requestJSON('CityProductionService','startProduction',[building.id, prodOption]);
        const response = await FoERequest.FetchRequestAsync(request);   
        FoEconsole.log(`Production building ${building.cityentity_id}(${building.id}) is producing now ${prodOption}`);  
        this.updateEntities(response.updatedEntities);
    }
    async setAllProductionBuildings(){
        const idleBuildings = await this.getIdleBuildings();
        if(idleBuildings.length === 0) return;
        FoEconsole.log("Started setting all production buildings");
        for(const building of idleBuildings) await this.setProductionBuilding(building);
        FoEconsole.log("Done");
    }
    collectAndSetBuildings = async ()=>{
        await toast.promise(
            new Promise(async (resolve,reject)=>{
                try {
                    await this.collectAllBuildings();
                    await this.setAllProductionBuildings();
                    resolve();
                } catch (error) {
                    reject(error);
            }}),
            {
                pending: `Collecting and setting all buildings`,
                success: `Finished collecting and setting all buildings`,
                error: {
                render({data}){
                    return `${data}`
                }
            }
        })  
    }
}

const FoECity = new FoeCity();

export { FoECity }