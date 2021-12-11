import { FoERequest } from "../FoeRequest";
import { requestJSON } from "../Utils";
import { FoEProxy } from "../FoeProxy";
import { FoEconsole } from "../Foeconsole/Foeconsole";
import { toast } from "react-toastify";
import { timer } from "../GlobalTimer";
import { getResponseMethod } from "../Utils";

const EventEmitter = require("events");

class FoeCastel extends EventEmitter{ 

    #collectionPointsAt = 0;
    get collectionPointsAt(){
        return this.#collectionPointsAt;
    }
    set collectionPointsAt(e){
        if(this.#collectionPointsAt === e) return;
        this.#collectionPointsAt = e;
        timer.addHandlerAt('dailyPointsCollectionAvailableAt', e, this.collectPoints);
    }
    #collectionRewardAt = 0;
    get collectionRewardAt(){
        return this.#collectionRewardAt;
    }
    set collectionRewardAt(e){
        if(this.#collectionRewardAt === e) return;
        this.#collectionRewardAt = e;
        timer.addHandlerAt('dailyRewardCollectionAvailableAt', e, this.collectReward);
    }
    #proxy;
    #autoCollectCastel = false;
    get autoCollectCastel(){
        return this.#autoCollectCastel;
    }
    set autoCollectCastel(e){
        if(this.#autoCollectCastel === e) return;
        this.#autoCollectCastel = e;
        localStorage.setItem('autoCollectCastel', JSON.stringify(e));
        if(e) {
            this.getOverview().then(response=>{
                this.collectionPointsAt = response.dailyPointsCollectionAvailableAt;
                this.collectionRewardAt = response.dailyRewardCollectionAvailableAt;
                this.#proxy = FoEProxy.addHandler('CastleSystemService','getOverview', (response)=>{
                    this.collectionPointsAt = response.dailyPointsCollectionAvailableAt;
                    this.collectionRewardAt = response.dailyRewardCollectionAvailableAt;
                });
            });
        }
        else FoEProxy.removeHandler(this.#proxy);
    }
    constructor() {
        super();  
        const loadedautoCollectCastel = localStorage.getItem('autoCollectCastel');
        if(loadedautoCollectCastel && loadedautoCollectCastel != 'null')
            this.autoCollectCastel = JSON.parse(loadedautoCollectCastel);
    }
    async getOverview(){
        const request = requestJSON('CastleSystemService','getOverview');
        const response = await FoERequest.FetchRequestAsync(request,{delay:0});
        return response;
    }
    collectPoints = async ()=>{
        const request = requestJSON('CastleSystemService','collectDailyPoints');
        const response = await FoERequest.FetchRequestAsync(request, {raw:true});
        FoEconsole.log('Castel points collected');
        toast.success('Castel points collected');
        
        const overview = getResponseMethod(response, "getOverview");
        this.collectionPointsAt = overview.dailyPointsCollectionAvailableAt;
    }
    collectReward = async ()=>{
        const request = requestJSON('CastleSystemService','collectDailyReward');
        const response = await FoERequest.FetchRequestAsync(request, {raw:true});
        FoEconsole.log('Castel reward collected');
        toast.success('Castel reward collected');

        const overview = getResponseMethod(response, "getOverview");
        this.collectionRewardAt = overview.dailyRewardCollectionAvailableAt;
    }
}

const FoECastel = new FoeCastel();

export { FoECastel }