import React, { useEffect,useState } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './GBWindow.scss';
import ListView from '../../ListView/ListView'
import { FoEGB } from '../../../FoeHelper/FoeGB/FoeGB';
import Input from '../../Input/Input';
import Checkbox from '../../Checkbox/Checkbox'
import GBuilding from './GBuilding';
import StealButton from '../../StealButton/StealButton';
import { toast } from 'react-toastify';
import { FoEPlayers } from '../../../FoeHelper/FoEPlayers/FoEPlayers';

const windowstyle = {
    width: 615,
    height: 385,
}


export default function GBWindow({open,setOpen}) {  

    const modifiedBuilding = (e)=>{      
        return e.map(building=>{
            return  [
                `#${building.player.rank}`, 
                building.player.name, 
                <GBuilding name={building.building.city_entity_id}/>,
                building.building.level,
                building.other.rank, 
                `${building.other.fp_needed}(${building.other.rankWithArcBonus})`,
                `${building.other.profit} FP`, 
                <StealButton 
                    onClick={async()=> await FoEGB.contributeForgePoints(
                            building.building.entity_id,
                            building.player.player_id,
                            building.building.level,
                            building.other.fp_needed)}/>
            ]
    })}

    const [data, setData] = useState(modifiedBuilding(FoEGB.foundBuildings))
    const [totalFP, settotalFP] = useState(0)
    const header = ['Rank', 'Player', 'Building', 'Level','Rank', 'FP',`Profit(${totalFP} FP)`, 'Action'];

    useEffect(() => {
        const updateData = (e)=>{      
            setData(modifiedBuilding(e))
            settotalFP(e.reduce((accumulator, currentValue)=>accumulator+currentValue.other.profit,0));
        }
        FoEGB.on('buildingsChanged',updateData);
        return () => {
            FoEGB.off('buildingsChanged',updateData);
        }
    }, [])

    return(
        <ModalWindow title={'GB Menu'} windowstyle={windowstyle} openWindow={open} closeWindow={()=>setOpen(false)}>
            <div className='row'>       
                <div className='col'>

                    <button 
                        className='orange-button'
                        onClick={async ()=> {
                        await toast.promise(
                            FoEGB.checkForGBRanks(),
                            {
                              pending: 'Checking GB ranks...',
                              success: 'Finished checking GB ranks.',
                              error: 'Error while checking GB ranks.'
                            }
                        )}}>Check Neighbors</button>
                </div>
                <div className='col'>
                    <Input label={'Arc bonus'}
                        min={1}
                        type={'Number'}
                        value={FoEGB.arcBonus} 
                        onChange={(e)=> FoEGB.arcBonus = e}/>   
                    <Input label={'Min profit'} min={1}
                        type={'number'}
                        value={ FoEGB.minProfit } 
                        onChange={(e)=> FoEGB.minProfit = e}/>
                </div>
                <div className='col'>
                <Checkbox label={'Include guild/friends'}
                        onChanged={(e)=> FoEGB.includeFriends = e}
                        checked={FoEGB.includeFriends}/>
                    <Input label={'Min return profit(%)'} 
                        min={1}
                        type={'number'}
                        value={ FoEGB.minReturnProfit } 
                        onChange={(e)=> FoEGB.minReturnProfit = e}/>
                </div>
            </div>
            <ListView
                header={header}
                data={data}/>
        </ModalWindow>
    )
}
