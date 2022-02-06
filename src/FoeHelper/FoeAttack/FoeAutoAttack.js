import { FoEPlayers } from '../FoEPlayers/FoEPlayers';
import { toast } from "react-toastify";
import { FoEAttack } from "./FoeAttack";
import { armyManagement } from '../ArmyManagement/ArmyManagement';
import { FoEconsole } from '../Foeconsole/Foeconsole';

const EventEmitter = require("events");

class FoeAutoAttack extends EventEmitter{  
    #autoAttackNeighbors=false;
    get autoAttackNeighbors(){
        return this.#autoAttackNeighbors;
    }
    set autoAttackNeighbors(e){
        if(this.#autoAttackNeighbors === e) return;
        this.#autoAttackNeighbors = e;
        localStorage.setItem('autoAttackNeighbors', JSON.stringify(e));
        if(e) this.attackAllNeighbors();
    }
    constructor(){
        super();   
        const loadedautoAttackNeighbors = localStorage.getItem('autoAttackNeighbors');
        if(loadedautoAttackNeighbors && loadedautoAttackNeighbors != 'null')
            this.autoAttackNeighbors = JSON.parse(loadedautoAttackNeighbors);             
    }

    async attackAllNeighbors(){
        await toast.promise(new Promise(async (resolve,reject)=>{
            const neighbors = (await FoEPlayers.getNeighborList()).filter(neighbor=> {
                    if(!neighbor.next_interaction_in && 
                        !neighbor.canSabotage) {
                        if(FoEPlayers.protectedPlayers) return FoEPlayers.protectedPlayers.indexOf(neighbor.player_id) === -1;
                        return true;
                    }
                    return false; 
                });
            if(neighbors.length === 0) {
                resolve('No neighbor available to attack');
                FoEconsole.log('No neighbor available to attack');
                return;
            }

            for (const neighbor of neighbors){
                await armyManagement.setNewAttackArmy(0);
                await FoEAttack.pvpAttack(FoEPlayers.currentPlayer,neighbor);
            }
            resolve();
        }),
        {
            pending: 'Attacking neighbors...',
            success: 'Finished attacking neighbors.',
            error: {
              render({data}){
                return `${data}`
              }
            }
        });
    }
}

const FoEAutoAttack = new FoeAutoAttack();

export { FoEAutoAttack }