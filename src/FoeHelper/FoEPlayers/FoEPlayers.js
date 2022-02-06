import { FoERequest } from "../FoeRequest";
import { requestJSON } from "../Utils";
import { FoEProxy } from "../FoeProxy";
const EventEmitter = require("events");

class FoePlayers extends EventEmitter{  
    currentPlayer;
    protectedPlayers;
    #ignorePlayers = "";

    get ignorePlayers(){
        return this.#ignorePlayers;
    }
    set ignorePlayers(e){
        if(this.#ignorePlayers === e) return;
        this.#ignorePlayers = e;
        localStorage.setItem('ignorePlayers', JSON.stringify(e));
    }
    #playerResources;
    get playerResources(){
        return this.#playerResources;
    }
    set playerResources(e){
        if(this.#playerResources === e) return;
        this.#playerResources = e;
        this.emit('playerResources', e);
    }

    constructor(){
        super();
        this.getResources();
        const loadedignorePlayers = localStorage.getItem('ignorePlayers');
        if(loadedignorePlayers && loadedignorePlayers != 'null')
            this.ignorePlayers = JSON.parse(loadedignorePlayers);

        FoEProxy.addHandler('StartupService', 'getData',(e)=> this.currentPlayer = e.user_data)
        FoEProxy.addHandler('OtherPlayerService', 'getCityProtections',(e)=> this.protectedPlayers = e.map(player=>player.playerId));
        // get player resources from request and from game
        FoEProxy.addHandler('ResourceService', 'getPlayerResources', (e)=> this.playerResources = e.resources);
        FoERequest.addHandler('ResourceService', 'getPlayerResources', (e)=> this.playerResources = e.resources);
    }
    async getFriendsList(){
        const playersToIgonore = this.ignorePlayers.split(/[ ,]+/);
        const request = requestJSON("OtherPlayerService","getFriendsList");
        const response = await FoERequest.FetchRequestAsync(request);
        return response.filter(player=> playersToIgonore.indexOf(player.name) === -1 && !player.is_self && player.accepted && !player.is_guild_member);    
    }
    async getClanMemberList(){
        const playersToIgonore = this.ignorePlayers.split(/[ ,]+/);
        const request = requestJSON("OtherPlayerService","getClanMemberList");
        const response = await FoERequest.FetchRequestAsync(request);
        return response.filter(player=> playersToIgonore.indexOf(player.name) === -1 && !player.is_self);
    }
    async getNeighborList(){
        const playersToIgonore = this.ignorePlayers.split(/[ ,]+/);
        const request = requestJSON("OtherPlayerService","getNeighborList");
        let response = await FoERequest.FetchRequestAsync(request);
        return response.filter(player=> playersToIgonore.indexOf(player.name) === -1 && !player.is_self && !player.is_friend && !player.is_guild_member);  
    }
    async getTavernSeats(){   
        const request = requestJSON("FriendsTavernService","getOwnTavern");
        const response = await FoERequest.FetchRequestAsync(request);

        const unlockedChairs = response.view.unlockedChairs;
        const occupiedSeats = response.view.visitors.length;

        return {"unlockedChairs":unlockedChairs,"occupiedSeats":occupiedSeats};
    }
    async visitPlayerCity(playerId){   
        const request = requestJSON("OtherPlayerService","visitPlayer",[playerId])  
        return await FoERequest.FetchRequestAsync(request);
    }
    async getResources(){
        const request = requestJSON("ResourceService","getPlayerResources");
        this.playerResources = (await FoERequest.FetchRequestAsync(request)).resources;
        return this.playerResources;
    }
    async getInventory(){
        const request = requestJSON("InventoryService","getItems");
        const response = await FoERequest.FetchRequestAsync(request,{delay:100});    
        return response;
    }
    async getTotalFP(){
        const playerInventory = await this.getInventory();
        let totalFP = this.playerResources.strategy_points;  
        for (const item of playerInventory){
            if(["small_forgepoints", "medium_forgepoints", "large_forgepoints"].indexOf(item.itemAssetName) !== -1)
                totalFP += (item.inStock * item['item']['resource_package']['gain']);
        }
        return totalFP;
    }
}

const FoEPlayers = new FoePlayers();

export { FoEPlayers }