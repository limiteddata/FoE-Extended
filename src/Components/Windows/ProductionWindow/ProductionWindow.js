import React, { useEffect,useState } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './ProductionWindow.scss';
import Checkbox from '../../Checkbox/Checkbox';
import Dropdown from 'react-dropdown';
import { FoECity } from '../../../FoeHelper/FoeProduction/FoeCity';
import SavedBuildings from './SavedBuildings';
import { goodsOptions, productionOptions} from './ProductionOptions';
const windowstyle = {
    width: 590,
    height: 450,
}

export default function ProductionWindow({open,setOpen}) {  

    return(
        <ModalWindow title={'Production Menu'} windowstyle={windowstyle} openWindow={open} closeWindow={()=>setOpen(false)}>
            <div className='flexRow'>
                <button className='orange-button' onClick={()=>FoECity.cancelProduction()}>Cancel production</button>
                <button className='orange-button' onClick={()=>FoECity.collectAndSetBuildings()}>Collect&Set prod.</button>
                <Checkbox
                    label={'Auto collect and set'}
                    onChanged={(e)=> FoECity.autoCollect = e}
                    checked={FoECity.autoCollect}/>
                <div className='flexRow'>
                    <p>Default production option</p>
                    <Dropdown 
                        options={productionOptions} 
                        onChange={(e)=> FoECity.defaultProductionOption = e.value} 
                        value={productionOptions[FoECity.defaultProductionOption-1]}/>
                </div>
                <div className='flexRow'>
                    <p>Default Goods option</p>
                    <Dropdown 
                        options={goodsOptions} 
                        onChange={(e)=>FoECity.defaultGoodsOption = e.value} 
                        value={goodsOptions[FoECity.defaultGoodsOption-1]}/>
                </div>
            </div>
            <SavedBuildings/>
        </ModalWindow>
    )
}
