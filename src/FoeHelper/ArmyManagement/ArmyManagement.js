import { ages, armyClass } from './items';
import { FoERequest } from '../FoeRequest';
import { FoEProxy } from '../FoeProxy'
import { FoEconsole } from '../Foeconsole/Foeconsole';

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
            if(loadedAttackArmy && loadedAttackArmy != 'null')
                this.attackArmy = JSON.parse(loadedAttackArmy);
            const loadedGvGArmy = localStorage.getItem('gvgArmy');
            if(loadedGvGArmy && loadedGvGArmy != 'null')
                this.gvgArmy = JSON.parse(loadedGvGArmy);

            this.armyTypes = await this.getArmyType();
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

    setNewArmy = async (setArmy) => {
        const attackarm = setArmy?setArmy:this.attackArmy;
        const defendingIDs = this.ArmyPool.defendingArmy.map(unit => unit.unitId);
        const arena_defendingIDs = this.ArmyPool.arenaDefending.map(unit => unit.unitId);
        let attackIDs = [];

        attackarm.forEach(unit => {
            for (let i = 0; i < this.ArmyPool.unassignedArmy.length; i++) {
                if (this.ArmyPool.unassignedArmy[i]["unitTypeId"] === unit.unitTypeId &&
                    this.ArmyPool.unassignedArmy[i]["currentHitpoints"] === 10 && !attackIDs.includes(this.ArmyPool.unassignedArmy[i]["unitId"])) {
                    attackIDs.push(this.ArmyPool.unassignedArmy[i]["unitId"]);
                    break;
                }
            }
        });

        const request = [{ "__class__": "ServerRequest", "requestData": [[{ "__class__": "ArmyPool", "units": [...attackIDs], "type": "attacking" }, { "__class__": "ArmyPool", "units": [...defendingIDs], "type": "defending" }, { "__class__": "ArmyPool", "units": [...arena_defendingIDs], "type": "arena_defending" }], { "__class__": "ArmyContext", "content": "main" }], "requestClass": "ArmyUnitManagementService", "requestMethod": "updatePools" }];
        await FoERequest.XHRRequestAsync(request, 0);
        FoEconsole.console('New army set');
    }
}

const armyManagement = new ArmyManagement();
export { armyManagement }