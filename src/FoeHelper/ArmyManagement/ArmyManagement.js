import { ages, armyClass } from './items';
import { FoERequest } from '../FoeRequest';
import { FoEProxy } from '../FoeProxy'
import { FoEconsole } from '../Foeconsole/Foeconsole';
import { requestJSON } from '../Utils';

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
        if(this.#gvgArmy === e) return;
        this.#gvgArmy = e;
        localStorage.setItem('gvgArmy', JSON.stringify(e));
    }

    #attackArmy = [];
    get attackArmy(){
        return this.#attackArmy;
    }
    set attackArmy(e){
        if(this.#attackArmy === e) return;
        this.#attackArmy = e;
        localStorage.setItem('attackArmy', JSON.stringify(e));
    }

    armyTypes = {}

    constructor() {   
        super();

        const loadedAttackArmy = localStorage.getItem('attackArmy');
        if(loadedAttackArmy && loadedAttackArmy != 'null')
            this.attackArmy = JSON.parse(loadedAttackArmy);
        const loadedGvGArmy = localStorage.getItem('gvgArmy');
        if(loadedGvGArmy && loadedGvGArmy != 'null')
            this.gvgArmy = JSON.parse(loadedGvGArmy);
        new Promise(async (res,err)=>{
            this.armyTypes = await this.getArmyType();
            FoEProxy.addHandler('getArmyInfo', this.__sortArmy) 
            res();
        }).then();
    }
    __sortArmy = (response)=>{
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
        this.emit("ArmyPoolChanged", this.ArmyPool);
    }
    updateArmy = async () => {
        this.__sortArmy(await this.getArmyInfo());
    }
    getArmyInfo = async () => {
        const request = requestJSON("ArmyUnitManagementService","getArmyInfo",[{ "__class__": "ArmyContext", "content": "main" }]);
        return await FoERequest.FetchRequestAsync(request,0);
    }

    getArmyType = async () => {
        const request = requestJSON("ArmyUnitManagementService","getUnitTypes");
        return await FoERequest.FetchRequestAsync(request,0).then(types=>{
            let convertedTypes = {};
            types.forEach(e => convertedTypes[e.unitTypeId] = e);
            return convertedTypes;
        });
    }

    setNewArmy = async (army) => {
        await this.updateArmy()
        let attackIDs = [];
        const defendingIDs = this.ArmyPool.defendingArmy.map(unit => unit.unitId);
        const arena_defendingIDs = this.ArmyPool.arenaDefending.map(unit => unit.unitId);
        army.forEach(unit => {
            for (let i = 0; i < this.ArmyPool.unassignedArmy.length; i++) {
                if (this.ArmyPool.unassignedArmy[i]["unitTypeId"] === unit.unitTypeId &&
                    this.ArmyPool.unassignedArmy[i]["currentHitpoints"] === 10 && !attackIDs.includes(this.ArmyPool.unassignedArmy[i]["unitId"])) {
                    attackIDs.push(this.ArmyPool.unassignedArmy[i]["unitId"]);
                    break;
                }
            }
        });
        const requestData = [
            [   
                { "__class__": "ArmyPool", "units": [...attackIDs], "type": "attacking" }, 
                { "__class__": "ArmyPool", "units": [...defendingIDs], "type": "defending" }, 
                { "__class__": "ArmyPool", "units": [...arena_defendingIDs], "type": "arena_defending" }
            ], { "__class__": "ArmyContext", "content": "main" }
        ];
        const request = requestJSON("ArmyUnitManagementService","updatePools",requestData);
        await FoERequest.FetchRequestAsync(request, 0);
        FoEconsole.log('New army set');
    }
    async setNewAttackArmy(index){
        if(!this.attackArmy[index]) {
            FoEconsole.log(`Attack army not set`)
            return -1;
        }
        await this.setNewArmy(this.attackArmy[index]);
    }
    async setNewGVGArmy(index){
        if(!this.attackArmy[index]) {
            FoEconsole.log(`GVG army not set`)
            return -1;
        }
        await this.setNewArmy(this.gvgArmy[index]);
    }
}

const armyManagement = new ArmyManagement();
export { armyManagement }