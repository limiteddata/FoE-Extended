import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { FoEPlayers } from "../FoEPlayers/FoEPlayers";
import { requestJSON } from "../Utils";
import { hasDeepValue } from "has-deep-value";
import { notPlunderableIDs } from "./NotPlunderableBuildings";
import { toast } from 'react-toastify';

const EventEmitter = require("events");

class FoePlunder extends EventEmitter{  
    #plunderMinAmount=1;
    get plunderMinAmount(){
        return this.#plunderMinAmount;
    }
    set plunderMinAmount(e){
        if(this.#plunderMinAmount === e) return;
        this.#plunderMinAmount = e;
        localStorage.setItem('plunderMinAmount', JSON.stringify(e));
    }

    #autoPlunder=false;
    get autoPlunder(){
        return this.#autoPlunder;
    }
    set autoPlunder(e){
        if(this.#autoPlunder === e) return;
        this.#autoPlunder = e;
        localStorage.setItem('autoPlunder', JSON.stringify(e));
    }

    #checkInterval=10;
    get checkInterval(){
        return this.#checkInterval;
    }
    set checkInterval(e){
        if(this.#checkInterval === e || e.constructor === Number()) return;
        this.#checkInterval = e;
        localStorage.setItem('checkInterval', JSON.stringify(e));
        if(this.autoCheckPlunder && this.#timeoutInterval) {   
            clearInterval(this.#timeoutInterval);
            this.#timeoutInterval = setInterval(()=> this.checkSabotage(),e*60000)
        }
    }

    #timeoutInterval;
    #autoCheckPlunder=false;
    get autoCheckPlunder(){
        return this.#autoCheckPlunder;
    }
    set autoCheckPlunder(e){
        if(this.#autoCheckPlunder === e || e.constructor === Number()) return;
        this.#autoCheckPlunder = e;
        localStorage.setItem('autoCheckPlunder', JSON.stringify(e));    
        if(e) this.#timeoutInterval = setInterval(()=> this.checkSabotage(),this.checkInterval*60000)
        else clearInterval(this.#timeoutInterval);
    }

    #plunderableBuildings=[];
    get plunderableBuildings(){
        return this.#plunderableBuildings;
    }
    set plunderableBuildings(e){
        if(JSON.stringify(this.#plunderableBuildings) === JSON.stringify(e)) return;
        this.#plunderableBuildings = e;
        this.emit("buildingsChanged", this.plunderableBuildings); 
    }

    constructor(){
        super();
        const loadedplunderMinAmount = localStorage.getItem('plunderMinAmount');
        if(loadedplunderMinAmount && loadedplunderMinAmount != 'null')
            this.plunderMinAmount = JSON.parse(loadedplunderMinAmount);

        const loadedautoPlunder = localStorage.getItem('autoPlunder');
        if(loadedautoPlunder && loadedautoPlunder != 'null')
            this.autoPlunder = JSON.parse(loadedautoPlunder);

        const loadedautoCheckPlunder = localStorage.getItem('autoCheckPlunder');
        if(loadedautoCheckPlunder && loadedautoCheckPlunder != 'null')
            this.autoCheckPlunder = JSON.parse(loadedautoCheckPlunder);
         
        const loadedcheckInterval = localStorage.getItem('checkInterval');
        if(loadedcheckInterval && loadedcheckInterval != 'null')
            this.checkInterval = JSON.parse(loadedcheckInterval);
    }
    __isPlunderable(entityname){
        for (let i = 0; i < notPlunderableIDs.length; i++)
            if(entityname.includes(notPlunderableIDs[i])) return false;  
        return true;
    }
    __getBestPlunderableBuilding(entities){
        let bestAvialableBuilding = null;
        // checking each building if it is connected, it can't be all those types and it is currently producing pf's
        // also it needs to not be motivated and the production to be finished
        // even more some buildings that are of type production they can't be plundered like statue of honor
        for (const entitie of entities){
            if(entitie.connected === 1 &&
            ["greatbuilding","decoration","culture","street","random_production"].indexOf(entitie.type) === -1&&
            hasDeepValue(entitie, "state.current_product.product.resources.strategy_points")&&
            entitie.state.is_motivated === false&&
            entitie.state.__class__ === "ProductionFinishedState"&&
            this.__isPlunderable(entitie.cityentity_id)&&
            entitie.state.current_product.product.resources.strategy_points >= this.plunderMinAmount){
                // getting the building with the highest pf 
                if(bestAvialableBuilding === null||
                    (entitie.state.current_product.product.resources.strategy_points >
                    bestAvialableBuilding.state.current_product.product.resources.strategy_points))
                        bestAvialableBuilding = entitie;
            }
        }
        return bestAvialableBuilding
    }

    async plunderBuilding(player_id,building_id){
        this.plunderableBuildings = this.plunderableBuildings.filter(e=> e.player_id !== player_id && e.building_id !== building_id)
        const request = requestJSON("OtherPlayerService","plunderById",[player_id, building_id]);
        const response = await FoERequest.FetchRequestAsync(request,0);
        if(response["result"]){
            FoEconsole.log(`Plunder ${response.result}`)
            if(response.result === "success"){
                toast.success(`Plunder success\nreward: ${JSON.stringify(response.product.product.resources.strategy_points)} FP`)
                FoEconsole.log(`reward: ${JSON.stringify(response.product.product.resources)}`)
                return response.product.product.resources.strategy_points;
            }
            toast.warning(`Plunder repelled`)
            return 0;
        }
        FoEconsole.log(`Plunder failed`)
        toast.error(`Plunder failed`)
        return 0;
    }
    async checkPlunder(){
        FoEconsole.log(`Checking buildings to sabotage...`);
        this.plunderableBuildings=[];
        const neighbors = await FoEPlayers.getNeighborList();

        for (const neighbor of neighbors){
            if(neighbor.canSabotage !== true) continue;
            const neighborCity = await FoEPlayers.visitPlayerCity(neighbor.player_id);
            const bestBuilding = this.__getBestPlunderableBuilding(neighborCity['city_map']['entities'])
            if(bestBuilding === null) continue;
            const newBuilding = {
                building_id: bestBuilding.id,
                player_id: bestBuilding.player_id,
                player_name: neighbor.name,
                player_rank: neighbor.rank,
                cityentity_id: bestBuilding.cityentity_id,
                fp:bestBuilding.state.current_product.product.resources.strategy_points
            }
            FoEconsole.log(`\n\n${newBuilding.player_name} #${newBuilding.player_rank}\nBuilding: ${newBuilding.cityentity_id}(id:${newBuilding.building_id})  -->  ${newBuilding.fp}pf`) 
            this.plunderableBuildings = [...this.plunderableBuildings,newBuilding];
            if(this.autoPlunder) await this.plunderBuilding(newBuilding.player_id, newBuilding.building_id);
        }
        FoEconsole.log(`Finished checking sabotage`);
    }
}

const FoEPlunder = new FoePlunder();

export { FoEPlunder }
