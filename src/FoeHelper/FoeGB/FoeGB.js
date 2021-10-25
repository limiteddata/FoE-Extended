import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { FoEPlayers } from "../FoEPlayers/FoEPlayers";
import { requestJSON } from "../Utils";
import { getResponseMethod } from "../Utils";

const EventEmitter = require("events");

class FoeGB extends EventEmitter{  
    #arcBonus = 90;
    get arcBonus(){
        return this.#arcBonus;
    }
    set arcBonus(e){
        if(this.#arcBonus === e) return;
        this.#arcBonus = Number(e);
        localStorage.setItem('arcBonus', JSON.stringify(e));
    }

    #minReturnProfit = 2; 
    get minReturnProfit(){
        return this.#minReturnProfit;
    }
    set minReturnProfit(e){
        if(this.#minReturnProfit === e) return;
        this.#minReturnProfit = Number(e);;
        localStorage.setItem('minReturnProfit', JSON.stringify(e));
    }

    #minProfit = 10;
    get minProfit(){
        return this.#minProfit;
    }
    set minProfit(e){
        if(this.#minProfit === e) return;
        this.#minProfit = Number(e);;
        localStorage.setItem('minProfit', JSON.stringify(e));
    }

    #includeFriends = false;
    get includeFriends(){
        return this.#includeFriends;
    }
    set includeFriends(e){
        if(this.#includeFriends === e) return;
        this.#includeFriends = e;
        localStorage.setItem('includeFriends', JSON.stringify(e));
    }

    #ignorePlayers = '';
    get ignorePlayers(){
        return this.#ignorePlayers;
    }
    set ignorePlayers(e){
        if(this.#ignorePlayers === e) return;
        this.#ignorePlayers = e;
        localStorage.setItem('ignorePlayers', JSON.stringify(e));
    }

    #foundBuildings=[];
    get foundBuildings(){
        return this.#foundBuildings;
    }
    set foundBuildings(e){
        if(JSON.stringify(this.#foundBuildings) === JSON.stringify(e)) return;
        this.#foundBuildings = e;
        this.emit("buildingsChanged", this.foundBuildings); 
    }


    constructor(){
        super();

        const loadedarcBonus = localStorage.getItem('arcBonus');
        if(loadedarcBonus && loadedarcBonus != 'null')
            this.arcBonus = JSON.parse(loadedarcBonus);

        const loadedMRP = localStorage.getItem('minReturnProfit');
        if(loadedMRP && loadedMRP != 'null')
            this.minReturnProfit = JSON.parse(loadedMRP);

        const loadedminProfit = localStorage.getItem('minProfit');
        if(loadedminProfit && loadedminProfit != 'null')
            this.minProfit = JSON.parse(loadedminProfit);

        const loadedincFriends = localStorage.getItem('includeFriends');
        if(loadedincFriends && loadedincFriends != 'null')
            this.includeFriends = JSON.parse(loadedincFriends);

        const loadedignorePlayers = localStorage.getItem('ignorePlayers');
        if(loadedignorePlayers && loadedignorePlayers != 'null')
            this.ignorePlayers = JSON.parse(loadedignorePlayers);
    }
    
    async contributeForgePoints(buildingId,playerId,buildingLvl,fp){     
        this.foundBuildings = this.foundBuildings.filter(e=> {
            if( e.building.entity_id === buildingId && e.player.player_id === playerId) return false
            return true;
        })
        const request = requestJSON("GreatBuildingsService","contributeForgePoints",[buildingId,playerId,buildingLvl,fp,false]);
        const response = await FoERequest.FetchRequestAsync(request,100);   
        FoEconsole.log(`Placed ${fp} FP to ${buildingId} from ${playerId}`);
        return response;
    }

    async getOpenedGB(playerId){
        const request = requestJSON("GreatBuildingsService","getOtherPlayerOverview",[playerId]);
        const response = await FoERequest.FetchRequestAsync(request,100);        
        return response.filter(building => building.current_progress && building.current_progress != 0);
    }

    async getGBranks(buildingId,playerId){
        const request = requestJSON("GreatBuildingsService","getConstruction",[buildingId,playerId]);
        const response = await FoERequest.FetchRequestAsync(request,0,true);
        const entitiy = getResponseMethod(response, "updateEntity")[0];
        if(entitiy.connected){
            const construction = getResponseMethod(response, "getConstruction");
            return construction.rankings.filter(rank=> rank.reward)
        }
        return []
    }

    async getStealableGBPlaces(player){
        const buildings = await this.getOpenedGB(player.player_id);
        for(const building of buildings){
            const ranks = await this.getGBranks(building.entity_id, player.player_id);
            const FPLeft = building.max_progress - building.current_progress;
            for(const rank of ranks){
                if(!rank.reward.strategy_point_amount) continue;
                if(rank.player.is_self === true)  break;
                const rankWithArcBonus = Math.round(rank.reward.strategy_point_amount * ((this.arcBonus+100) / 100) );
                const FPNeeded = Math.round(FPLeft / 2); 
                if(rank.forge_points) FPNeeded += Math.round(rank.forge_points/2);
                if(FPNeeded >= rankWithArcBonus) continue;

                if(building.current_progress + FPNeeded >= building.max_progress) continue;
                const profit = rankWithArcBonus-FPNeeded;

                if(profit < this.minProfit) continue;  
                const minimumReturnProfit = Math.round( (this.minReturnProfit/100) * FPNeeded );
                if(profit < minimumReturnProfit) continue;

                const newBld = {
                    player: { ...player },
                    building: { ...building },
                    other: {
                        fp_needed: FPNeeded,
                        rankWithArcBonus: rankWithArcBonus,
                        arcBonus: this.arcBonus,
                        rank: rank.rank,
                        profit: profit
                    }
                }
                this.foundBuildings = [...this.foundBuildings, newBld];
                FoEconsole.log(`\n\n${player.name} #${player.rank}\n${building.name} lvl:${building.level}\nPlace ${rank.rank} FP: ${FPNeeded}(${this.arcBonus}:${rankWithArcBonus}) profit: ${profit}`);
            }
        }
    }

    async CheckBuildings(playerList){
        this.foundBuildings=[];
        const playersToIgonore = this.ignorePlayers.split(',');
        for(const player of playerList ){
            if(player.is_active && playersToIgonore.indexOf(player.name) === -1) 
                await this.getStealableGBPlaces(player);
        }
        FoEconsole.log('Finished scanning buildings');
    }

    async checkForNeighborGB(){
        const neighbors = await FoEPlayers.getNeighborList(false, this.includeFriends, false);
        await this.CheckBuildings(neighbors);
    }

    async checkForGuildGB(){
        FoEconsole.log('Scanning Guild');
        const clanmembers = await FoEPlayers.getClanMemberList();
        await this.CheckBuildings(clanmembers);
    }
}

const FoEGB = new FoeGB();

export { FoEGB }


