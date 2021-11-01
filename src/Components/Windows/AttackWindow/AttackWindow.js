import React, { useEffect,useState } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './AttackWindow.scss';
import Checkbox from '../../Checkbox/Checkbox';
import Input from '../../Input/Input';
import { armyManagement } from '../../../FoeHelper/ArmyManagement/ArmyManagement';
import { FoEAutoAttack } from '../../../FoeHelper/FoeAttack/FoEAutoAttack';
import { FoEAutoExp } from '../../../FoeHelper/FoeAttack/FoeAutoExp';
import { FoEGBG } from '../../../FoeHelper/FoeAttack/FoeGBG/FoeGBG';
import Dropdown from 'react-dropdown';
import { sectors } from '../../../FoeHelper/FoeAttack/FoeGBG/map1Sectors';

const windowstyle = {
    width: 490,
    height: 385,
}

export default function AttackWindow({open,setOpen}) {  
    const [autoExp, setautoExp] = useState(FoEAutoExp.autoExpedition);
    const [sector, setsector] = useState('A1MT');

    useEffect(() => {
        // on window mount
        const update = (e)=> setautoExp(e);
        FoEAutoExp.on('autoExpeditionChanged',update);
        return () => {
            //cleanup
            FoEAutoExp.off('autoExpeditionChanged',update)
        }
    }, [])

    return(
        <ModalWindow title={'Attack Menu'} windowstyle={windowstyle} openWindow={open} closeWindow={()=>setOpen(false)}>
            
            <div className='flexRow' style={{marginTop:15}}>
                <button className='orange-button' 
                    onClick={async ()=> FoEAutoAttack.attackAllNeighbors()} >Attack Neighbors</button>
                <Checkbox label={'Auto Attack Neighbors'}
                    onChanged={(e)=> FoEAutoAttack.autoAttackNeighbors = e}
                    checked={FoEAutoAttack.autoAttackNeighbors}/>
            </div>
            


            <div className='flexRow'>
                <button className='orange-button' 
                    onClick={async ()=> await FoEAttack.attackExp()} >Attack GVG</button>
                <Checkbox label={'Auto attack gvg'}
                    onChanged={(e)=> FoEAutoMPT.autoMotivateNeighbors = e}
                    checked={false}/> 
            </div>

            <div className='flexRow'>
                <button className='orange-button' 
                    onClick={async ()=> await FoEPlayerUtils.MotivateNeighbors()} >Defend GVG</button>
                <Checkbox label={'Auto defend gvg'}
                    onChanged={(e)=> FoEAutoMPT.autoMotivateNeighbors = e}
                    checked={false}/>  
            </div>

            <div className='flexRow'>
                <button className='orange-button' 
                    onClick={async ()=> await FoEGBG.attackGBG(sector)} >Attack GBG</button>
                <Input
                    type={'Number'} 
                    label={'Num. attacks'} 
                    min={1} 
                    style={{width:85}}
                    value={FoEGBG.numAttacks} 
                    onChange={(e)=>FoEGBG.numAttacks = e}/>
                <Dropdown 
                    onChange={(e)=>setsector(e.value)}
                    options={Object.keys(sectors)}  
                    value={sector} />
            </div>
            <Checkbox label={'Auto Expedition'}
                onChanged={(e)=> FoEAutoExp.autoExpedition = e}
                checked={autoExp}/>  
        </ModalWindow>
    )
}
