import { ages, armyClass } from './items';
import { FoERequest } from '../FoeRequest';
import { FoEProxy } from '../FoeProxy'

const EventEmitter = require("events");

class ArmyManagement extends EventEmitter{  
    ArmyPool = {
        defendingArmy: [],
        arenaDefending: [],
        unassignedArmy: []
    }
    #gvgArmy = [];
    get gvgArmy(){
        return this.#gvgArmy;
    }
    set gvgArmy(e){
        this.#gvgArmy = e;
        localStorage.setItem('gvgArmy', JSON.stringify(e));
    }

    #attackArmy = [];
    get attackArmy(){
        return this.#attackArmy;
    }
    set attackArmy(e){
        this.#attackArmy = e;
        localStorage.setItem('attackArmy', JSON.stringify(e));
    }

    armyTypes = {}

    constructor() {   

        super();
        new Promise(async (resolve, rejects) =>{
            const loadedAttackArmy = localStorage.getItem('attackArmy');
            if(loadedAttackArmy != 'null' )
                this.attackArmy = JSON.parse(loadedAttackArmy);

            const loadedGvGArmy = localStorage.getItem('gvgArmy');
            if(loadedGvGArmy !== 'null' )
                this.gvgArmy = JSON.parse(loadedGvGArmy);

            this.armyTypes = await this.getArmyType();
            //[window.gameVars.world_id]
            FoEProxy.addHandler('getArmyInfo', response => {
                if (response.units === null) return;
                // sort each unit into groups of same type
                const temp = { 'defending': [], 'arenaDefending': [] };
                for (let i = 0; i < response.units.length; i++) {
                    if(response.units[i].is_defending) temp['defending'].push(response.units[i]);
                    else if(response.units[i].isArenaDefending) temp['arenaDefending'].push(response.units[i]);
                    else{
                        if (!temp.hasOwnProperty(response.units[i].unitTypeId)) temp[response.units[i].unitTypeId] = [];
                        temp[response.units[i].unitTypeId].push(response.units[i]);
                    }
                }
                // sort by health
                for (const unit in temp)
                    temp[unit] = temp[unit].sort((a, b) => b.currentHitpoints - a.currentHitpoints);
                // filter by era and by class
                let final = [];
                for (let i = ages.length - 1; i > 0; i--) {
                    for (let x = 0; x < armyClass.length; x++) {
                        for (const unit in temp) {
                            // if unit era match with age and army class then push to final and splice from temp
                            if (unit !== 'defending' &&
                                unit !== 'arenaDefending' &&
                                this.armyTypes[unit].minEra === ages[i] &&
                                this.armyTypes[unit].unitClass === armyClass[x]) {
                                final = [...final, ...temp[unit]];
                                delete temp[unit];
                            }
                        }
                    }
                }


                this.ArmyPool = {
                    defendingArmy: temp.defending,
                    arenaDefending: temp.arenaDefending,
                    unassignedArmy: final
                }
                this.emit("ArmyPoolCanged", this.ArmyPool);
                
            });
            resolve();
        }).then();
    }
    getArmyInfo = async () => {
        let request = [{ "__class__": "ServerRequest", "requestData": [{ "__class__": "ArmyContext", "content": "main" }], "requestClass": "ArmyUnitManagementService", "requestMethod": "getArmyInfo" }];
        return await FoERequest.XHRRequestAsync(request);
    }

    getArmyType = async () => {
        let request = [{ "__class__": "ServerRequest", "requestData": [], "requestClass": "ArmyUnitManagementService", "requestMethod": "getUnitTypes" }];
        return await FoERequest.FetchRequestAsync(request).then(types=>{
            let convertedTypes = {};
            types.forEach(e => convertedTypes[e.unitTypeId] = e);
            return convertedTypes;
        });
    }

    setNewArmy = async (fetch=false) => {
        /*
        const defendingIDs = this.Army.defendingArmy.map(unit => unit.unitId);
        const arena_defendingIDs = this.Army.arenaDefending.map(unit => unit.unitId);
        let attackIDs = [];
        this.Army.attackArmy.forEach(unit => {
            for (let i = 0; i < this.Army.armyPool.length; i++) {
                if (this.Army.armyPool[i]["unitTypeId"] === unit.unitTypeId &&
                    this.Army.armyPool[i]["currentHitpoints"] === 10 && !attackIDs.includes(this.Army.armyPool[i]["unitId"])) {
                    attackIDs.push(this.Army.armyPool[i]["unitId"]);
                    break;
                }
            }
        });
        const request = [{ "__class__": "ServerRequest", "requestData": [[{ "__class__": "ArmyPool", "units": [...attackIDs], "type": "attacking" }, { "__class__": "ArmyPool", "units": [...defendingIDs], "type": "defending" }, { "__class__": "ArmyPool", "units": [...arena_defendingIDs], "type": "arena_defending" }], { "__class__": "ArmyContext", "content": "main" }], "requestClass": "ArmyUnitManagementService", "requestMethod": "updatePools" }];
        await FoERequest.XHRRequestAsync(request, 0);
        console.log('New army set');*/
    }
}

const armyManagement = new ArmyManagement();
export { armyManagement }