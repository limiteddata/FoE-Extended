import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { armyManagement } from "../ArmyManagement/ArmyManagement";
import { requestJSON } from "../Utils";
import { FoEPlayers } from '../FoEPlayers/FoEPlayers';
import { getResponseMethod } from "../Utils";
import { toast } from "react-toastify";

const EventEmitter = require("events");

class FoeAttack extends EventEmitter{  
    
    constructor(){
        super();            
    }

    async NewAttack(attackOptions){
        FoEconsole.log("New Attack");
        const request = requestJSON("BattlefieldService","startByBattleType",[attackOptions,true]);
        let response = await FoERequest.FetchRequestAsync(request,{raw:true});
        let battleResponse = getResponseMethod(response,"startByBattleType")

        if(battleResponse.state.winnerBit === 1){
            FoEconsole.log("Won first battle");  
            if(battleResponse.battleType.totalWaves === 2){
                response = await FoERequest.FetchRequestAsync(request,{raw:true});
                battleResponse = getResponseMethod(response,"startByBattleType")
                if(battleResponse.state.winnerBit === 1) FoEconsole.log("Won second battle");
                else{
                    FoEconsole.log("Lost second battle");     
                    return 1;
                }
            }
            const rewards = getResponseMethod(response,"collectReward");

            if(rewards) 
                for (const reward of rewards[0]) 
                    FoEconsole.log(`Reward ${reward.name}`)
            return -1;
        }
        FoEconsole.log("Lost first battle");
        return 1;
    }
    async pvpAttack(attacker,deffender){
        const attackOption = {
            "__class__":"PvpBattleType",
            "attackerPlayerId": attacker.player_id,
            "defenderPlayerId": deffender.player_id,
            "era":null,
            "type":"pvp",
            "currentWaveId":0,
            "totalWaves":0,
            "isRevenge":false
        }
        const attackresponse = await this.NewAttack(attackOption);
        FoEconsole.log(`Attacked player ${deffender.name}`); 
        return attackresponse;
    }
    async expeditionAttack(encounterId){
        const attackOption = {
            "__class__":"GuildExpeditionBattleType",
            "attackerPlayerId":0,
            "defenderPlayerId":0,
            "era":null,
            "type":"guild_expedition",
            "currentWaveId":0,
            "totalWaves":0,
            "encounterId":encounterId,
            "armyId":0
        }
        return await this.NewAttack(attackOption);
    }
    async gvgAttack(sectorId,againstSiege){
        const attackOption = {
            "__class__":"ClanBattleBattleType",
            "attackerPlayerId":0,
            "defenderPlayerId":0,
            "era":null,
            "type":"clan",
            "currentWaveId":0,
            "totalWaves":0,
            "sectorId":sectorId,
            "provinceId":0,
            "armyId":0,
            "againstSiege":againstSiege
        }
        return await this.NewAttack(attackOption);
    }
    async gbgAttack(provinceId){
        const attackOption = {
            "__class__":"BattlegroundBattleType",
            "attackerPlayerId":0,
            "defenderPlayerId":0,
            "era":null,
            "type":"battleground",
            "currentWaveId":0,
            "totalWaves":0,
            "provinceId":provinceId,
            "battlesWon":0
        }
        return await this.NewAttack(attackOption);
    }
}

const FoEAttack = new FoeAttack();

export { FoEAttack }