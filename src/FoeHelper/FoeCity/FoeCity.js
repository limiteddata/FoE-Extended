import { FoERequest } from "../FoeRequest";
import { requestJSON } from "../Utils";
import { FoEProxy } from "../FoeProxy";
import { FoEconsole } from "../Foeconsole/Foeconsole";
import { toast } from "react-toastify";
const EventEmitter = require("events");

class FoeCity extends EventEmitter{ 
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
    #autoInterval;
    #autoCollect=false;
    get autoCollect(){
        return this.#autoCollect;
    }
    set autoCollect(e){
        if(this.#autoCollect === e) return;
        this.#autoCollect = e;
        localStorage.setItem('autoCollect', JSON.stringify(e));
        if(e) {
            this.collectAndSetBuildings();
            this.#autoInterval = setInterval(()=>{
                if(!this.entities) return;
                const nowTimestamp = Math.floor(Date.now() / 1000);
                let updatedEntities = 0;
                for (let i = 0; i < this.entities.length; i++) {
                    if( this.entities[i].state.__class__ === 'ProductionFinishedState' ||
                        (this.entities[i].state.__class__ === "ProducingState" && 
                        nowTimestamp >= this.entities[i].state.next_state_transition_at) ) {
                            this.collectAndSetBuilding(this.entities[i]);
                            updatedEntities++;
                        }
                }
                if(updatedEntities>0) toast.success(`Collected and set ${updatedEntities} buildings`);
            },3000)
        }
        else clearInterval(this.#autoInterval);
    }
    
    constructor(){
        super();
        const loadedmanualBuildings = localStorage.getItem('manualBuildings');
        if(loadedmanualBuildings && loadedmanualBuildings != 'null')
            this.manualBuildings = JSON.parse(loadedmanualBuildings);

        FoEProxy.addHandler('getData', e => this.entities=e.city_map.entities);
        FoEProxy.addHandler('cancelProduction', e => this.updateEntities(e.updatedEntities));
        FoEProxy.addHandler('startProduction', e => this.updateEntities(e.updatedEntities));
        FoEProxy.addHandler('completeProduction', e => this.updateEntities([e]));
        FoEProxy.addHandler('placeBuilding', e => this.entities.push(e) );
        
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
    updateEntities(entities){
        for (const entitie of entities) {
            for (let i = 0; i < this.entities.length; i++) {
                if(this.entities[i].id === entitie.id) {
                    this.entities[i] = entitie;
                    break;
                }
            }            
        }
    }
    async getBuildings(){
        if(this.entities.length > 0) return this.entities;
        const request = requestJSON('StartupService','getData');
        const response = await FoERequest.FetchRequestAsync(request, {delay: 100});
        this.entities = response.city_map.entities;
        return this.entities;
    }
    async collectAndSetBuilding(building){
        await this.collectBuilding(building);
        await this.setProductionBuilding(building);
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
            const response = await FoERequest.FetchRequestAsync(request,{delay:100});
            this.updateEntities(response.updatedEntities);
            
        }
        FoEconsole.log("Done");
    }
    async getColectableBuildings(){
        const buildings = await this.getBuildings();
        const nowTimestamp = Math.floor(Date.now() / 1000);
        return buildings.filter(building=> building.state.__class__ === 'ProductionFinishedState'|| 
            (building.state.__class__ === "ProducingState" && nowTimestamp >= building.state.next_state_transition_at));
    }
    async collectBuilding(building){
        const request = requestJSON('CityProductionService', 'pickupProduction', [[building.id]]);
        const response = await FoERequest.FetchRequestAsync(request,{delay:0});  
        FoEconsole.log(`Building ${building.cityentity_id} collected`);
        this.updateEntities(response.updatedEntities);
    }

    async collectAllBuildings(){
        const buildings = (await this.getColectableBuildings()).map(building=>building.id);
        if(buildings.length === 0) return;
        FoEconsole.log('Collecting all buildings');
        const request = requestJSON('CityProductionService', 'pickupProduction', [buildings]);
        const response = await FoERequest.FetchRequestAsync(request,{delay:100});  
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
        if(this.manualBuildings[building.id]) prodOption = this.manualBuildings[building.id].option;
        else if(building.type === "goods") prodOption = this.defaultGoodsOption;
        else prodOption = this.defaultProductionOption;
        if(building.type === "goods" && prodOption>4 ) prodOption = 4;
        const request = requestJSON('CityProductionService','startProduction',[building.id, prodOption]);
        const response = await FoERequest.FetchRequestAsync(request, {delay:200});   
        FoEconsole.log(`Production building ${building.cityentity_id}(${building.id}) is produceing now ${prodOption}`);  
        this.updateEntities(response.updatedEntities);
    }
    async setAllProductionBuildings(){
        const idleBuildings = await this.getIdleBuildings();
        if(idleBuildings.length === 0) return;
        FoEconsole.log("Started setting all production buildings");
        for(const building of idleBuildings) await this.setProductionBuilding(building);
        FoEconsole.log("Done");
    }
    async collectAndSetBuildings(){
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