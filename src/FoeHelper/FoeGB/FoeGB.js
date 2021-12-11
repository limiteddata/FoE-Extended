import { FoEconsole } from "../Foeconsole/Foeconsole";
import { FoERequest } from "../FoeRequest";
import { FoEPlayers } from "../FoEPlayers/FoEPlayers";
import { requestJSON } from "../Utils";
import { getResponseMethod } from "../Utils";
import { toast } from 'react-toastify';

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
        this.#minReturnProfit = Number(e);
        localStorage.setItem('minReturnProfit', JSON.stringify(e));
    }

    #minProfit = 10;
    get minProfit(){
        return this.#minProfit;
    }
    set minProfit(e){
        if(this.#minProfit === e) return;
        this.#minProfit = Number(e);
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
    }
    
    async contributeForgePoints(buildingId,playerId,buildingLvl,fp){  
        const response = await toast.promise(
            new Promise(async (resolve, rejects)=>{
                const availableFP = await FoEPlayers.getTotalFP();
                if(fp > availableFP){
                    rejects(`Not enough forge points`);
                    return;
                }
                this.foundBuildings = this.foundBuildings.filter(e=> {
                    if( e.building.entity_id === buildingId && e.player.player_id === playerId) return false
                    return true;
                })
                const request = requestJSON("GreatBuildingsService","contributeForgePoints",[buildingId,playerId,buildingLvl,fp,false]);
                resolve(await FoERequest.FetchRequestAsync(request));
            }),
        {
            pending: 'Contributing to building...',
            success: `Succesfuly contributed ${fp} FP.`,
            error: {
                render({data}){
                    return `${data}`
                }
            }
        })
        FoEconsole.log(`Placed ${fp} FP to ${buildingId} from ${playerId}`);
        return response;
    }

    async getOpenedGB(playerId){
        const request = [
            // visit the player
            requestJSON("OtherPlayerService","visitPlayer",[playerId], true),
            // get all the GBs
            requestJSON("GreatBuildingsService","getOtherPlayerOverview",[playerId], true)
        ];
        const response = await FoERequest.FetchRequestAsync(request,{raw:true});    
        const entities = getResponseMethod(response, "visitPlayer")['city_map']['entities'];
        const gbs = getResponseMethod(response, "getOtherPlayerOverview");
        return gbs.filter(building => {
            for (let i = 0; i < entities.length; i++) {
                if(entities[i]['id'] === building.entity_id && 
                    entities[i]['connected'] === 1 &&
                    building.current_progress && 
                    building.current_progress != 0
                    ) return true;
            }
           return false
        });
    }

    async getGBuildingsRanks(buildings, playerId){
        if(!buildings || buildings.length===0) return [];
        const request = buildings.map(building=> requestJSON("GreatBuildingsService","getConstruction",[building.entity_id,playerId], true));
        let response = await FoERequest.FetchRequestAsync(request);
        response = Array.isArray(response) ? response: [response];
        // this might be bad but the recived rankings have no building id so the way ill associate them 
        // will be a little blind, i'll just consider that the server will keep the building order i gave 
        // need to check
        for (let i = 0; i < response.length; i++) response[i]['building'] = buildings[i];     
        return response;
    }

    getStealableGBPlaces = async (player)=>{
        try {
            const openedBuildings = await this.getOpenedGB(player.player_id);
            const buildingsWithRanks = await this.getGBuildingsRanks(openedBuildings, player.player_id);
            for(const bldWithRanks of buildingsWithRanks){
                const FPLeft = bldWithRanks.building.max_progress - bldWithRanks.building.current_progress;
                for(const rank of bldWithRanks.rankings){
                    if(rank.player.is_self === true)  break;
                    if(rank.player.player_id === player.player_id)  continue;
                    if(!rank.reward) continue;
                    if(!rank.reward.strategy_point_amount) continue;
    
                    const rankWithArcBonus = Math.round(rank.reward.strategy_point_amount * ((this.arcBonus+100) / 100) );
                    
                    const FPNeeded = Math.round(FPLeft / 2); 
                    if(rank.forge_points) FPNeeded += Math.round(rank.forge_points/2);
                    if(FPNeeded >= rankWithArcBonus) continue;
    
                    if(bldWithRanks.building.current_progress + FPNeeded >= bldWithRanks.building.max_progress) continue;
                    const profit = rankWithArcBonus-FPNeeded;
                    if(profit < this.minProfit) continue;  
                    const minimumReturnProfit = Math.round( (this.minReturnProfit/100) * FPNeeded );
                    if(profit < minimumReturnProfit) continue;
    
                    const newBld = {
                        player: { ...player },
                        building: { ...bldWithRanks.building },
                        other: {
                            fp_needed: FPNeeded,
                            rankWithArcBonus: rankWithArcBonus,
                            arcBonus: this.arcBonus,
                            rank: rank.rank,
                            profit: profit,
                            timestamp: new Date().toTimeString().slice(0,8)
                        }
                    }
                    this.foundBuildings = [...this.foundBuildings, newBld];
                    FoEconsole.log(`\n\n${player.name} #${player.rank}\n${bldWithRanks.building.name} lvl:${bldWithRanks.building.level}\nPlace ${rank.rank} FP: ${FPNeeded}(${this.arcBonus}:${rankWithArcBonus}) profit: ${profit}`);
                    
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    async CheckBuildings(playerList){
        this.foundBuildings=[];
        for(const player of playerList ){
            if(player.is_active && player.has_great_building) await this.getStealableGBPlaces(player);
        }
        FoEconsole.log('Finished scanning buildings');
    }

    checkForGBRanks = async()=>{
        await toast.promise(
            async ()=>{
                FoEconsole.log('Scanning GB ranks to steal');
                const neighbors = await FoEPlayers.getNeighborList();
                let players = neighbors;
                if(this.includeFriends){
                    const clanmembers = await FoEPlayers.getClanMemberList();
                    const friends = await FoEPlayers.getFriendsList();
                    players = [...players, ...clanmembers, ...friends];
                }
                await this.CheckBuildings(players);
            },
            {
                pending: 'Checking GB ranks...',
                success: 'Finished checking GB ranks.',
                error: 'Error while checking GB ranks.'
            }
        );
    }
}

const FoEGB = new FoeGB();

export { FoEGB }


