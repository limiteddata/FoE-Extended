import React from 'react'
import CityBuilding from '../../CityBuilding/CityBuilding';
import Dropdown from 'react-dropdown';
import SimpleCheckbox from '../../SimpleCheckbox/SimpleCheckbox';
import { FoECity } from '../../../FoeHelper/FoeCity/FoeCity';
import { goodsOptions, productionOptions} from './ProductionOptions';
export default function SavedBuilding({building}) {
    const options = building.type === "goods"? goodsOptions : productionOptions;
    return (
            <div className='savedBuildingBody'>
                <CityBuilding 
                    name={building.cityentity_id}
                    height={70}/>
                <Dropdown 
                    options={options} 
                    onChange={(e)=>{
                        let old = {...FoECity.manualBuildings};
                        old[building.id].option = e.value;
                        FoECity.manualBuildings = old;
                    }} 
                    value={options[building.option-1]}/>
                <div className='flexRow'>                    
                    <SimpleCheckbox
                        label={'Cancelable'}
                        onChanged={(e)=> {
                            let old = {...FoECity.manualBuildings};
                            old[building.id].cancelable = e;
                        }}
                        checked={building.cancelable}/>
                    <div className='removeButton' onClick={()=>{
                        let oldBld = {...FoECity.manualBuildings};
                        delete oldBld[building.id];
                        FoECity.manualBuildings = oldBld;
                    }}></div>
                </div>
            </div>
    )
}
