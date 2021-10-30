import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { armyManagement } from "../ArmyManagement/ArmyManagement";
import { requestJSON } from "../Utils";
import { FoEPlayers } from '../FoEPlayers/FoEPlayers';
import { getResponseMethod } from "../Utils";
import { toast } from "react-toastify";
import { FoEAttack } from "./FoeAttack";

const EventEmitter = require("events");

class FoeAutoAttack extends EventEmitter{  
    
    constructor(){
        super();            
    }


    async attackAllNeighbors(){
        const neighbors = await FoEPlayers.getNeighborList();
        const attacker = FoEPlayers.currentPlayer;
        await toast.promise(
        new Promise(async resolve=>{
            for (const neighbor of neighbors){
                if(!neighbor.next_interaction_in && 
                    neighbor.canSabotage === false &&
                    FoEPlayers.protectedPlayers.indexOf(neighbor.player_id) === -1) await FoEAttack.pvpAttack(attacker,neighbor)
            }
            resolve();
        }),
        {
            pending: 'Attacking neighbors...',
            success: 'Finished attacking neighbors.',
            error: 'Error while attacking neighbors.'
        })   

    }

    
}

const FoEAutoAttack = new FoeAutoAttack();

export { FoEAutoAttack }