import { FoEPlayers } from '../FoEPlayers/FoEPlayers';
import { toast } from "react-toastify";
import { FoEAttack } from "./FoeAttack";
import { armyManagement } from '../ArmyManagement/ArmyManagement';

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
        const neighbors = await FoEPlayers.getNeighborList();
        const attacker = FoEPlayers.currentPlayer;
        await toast.promise(
        new Promise(async (resolve,reject)=>{
            try {
                for (const neighbor of neighbors){
                    if(!neighbor.next_interaction_in && 
                        neighbor.canSabotage === false 
                        //&&
                        //FoEPlayers.protectedPlayers.indexOf(neighbor.player_id) === -1
                        ){
                            await armyManagement.setNewAttackArmy(0);
                            await FoEAttack.pvpAttack(attacker,neighbor);
                        }
                }
                resolve();
            } catch (error) {
                reject(error);
            }

        }),
        {
            pending: 'Attacking neighbors...',
            success: 'Finished attacking neighbors.',
            error: {
              render({data}){
                return `${data}`
              }
            }
          })   
    }

    
}

const FoEAutoAttack = new FoeAutoAttack();

export { FoEAutoAttack }