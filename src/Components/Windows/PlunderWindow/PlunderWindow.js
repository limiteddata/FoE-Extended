import React, { useEffect,useState } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import ListView from '../../ListView/ListView'
import { FoEPlunder } from '../../../FoeHelper/FoePlunder/FoePlunder';
import Checkbox from '../../Checkbox/Checkbox';
import Input from '../../Input/Input';
import { toast } from 'react-toastify';
import CityBuilding from '../../CityBuilding/CityBuilding';
import StealButton from '../../StealButton/StealButton';

const windowstyle = {
    width: 615,
    height: 385,
}
export default function PlunderWindow({open,setOpen}) {  
    
    const modifiedBuilding = (e)=>{ 
        return e.map(building=>{
            return  [
                `#${building.player_rank}`, 
                building.player_name, 
                <CityBuilding name={building.cityentity_id}/>,
                building.cityentity_id.split('_')[2], 
                `${building.fp} FP`, 
                <StealButton
                    onClick={()=>FoEPlunder.plunderBuilding(building.player_id, building.building_id)}/>
            ]
    })}
    const [data, setData] = useState(modifiedBuilding(FoEPlunder.plunderableBuildings))
    const [totalFP, settotalFP] = useState(0)
    const header = ['ID', 'Player', 'Building', 'Name', `FP (Total ${totalFP} FP)`, 'Action'];
    useEffect(() => {
        const updateData = (e)=>{      
            setData(modifiedBuilding(e))
            settotalFP(e.reduce((accumulator, currentValue)=>accumulator+currentValue.fp,0));
        }
        FoEPlunder.on('buildingsChanged',updateData);
        return () => {
            FoEPlunder.off('buildingsChanged',updateData);
        }
    }, [])
    return(
        <ModalWindow title={'Plunder Menu'} windowstyle={windowstyle} openWindow={open} closeWindow={()=>setOpen(false)}>
            <div className='flexRow'>       
                <div className='flexCol'>
                    <button 
                        className='orange-button'
                        onClick={async ()=>{
                        settotalFP(0);
                        await FoEPlunder.checkPlunder();
                    }}>Check Plunder</button>
                </div>
                <div className='flexCol'>
                    <Checkbox label={'Auto plunder'}                        
                        onChanged={(e)=> FoEPlunder.autoPlunder = e}
                        checked={FoEPlunder.autoPlunder}/>
                    <Checkbox label={'Auto check sabotage'}                        
                        onChanged={(e)=> FoEPlunder.autoCheckPlunder = e}
                        checked={FoEPlunder.autoCheckPlunder}/>            
                </div>
                <div className='flexCol'>
                    <Input label={'Min plunder'} min={1}
                        value={FoEPlunder.plunderMinAmount} 
                        onChange={(e)=>FoEPlunder.plunderMinAmount = e}/>
                    <Input label={'Check interval (min.)'} min={1}
                        value={FoEPlunder.checkInterval} 
                        onChange={(e)=>FoEPlunder.checkInterval = e}/>
                </div>
            </div>
            <ListView
                header={header}
                data={data}/>
        </ModalWindow>
    )
}
