import React, { useEffect,useState } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './AttackWindow.scss';
import Checkbox from '../../Checkbox/Checkbox';
import Input from '../../Input/Input';
import { armyManagement } from '../../../FoeHelper/ArmyManagement/ArmyManagement';
import { FoEAutoAttack } from '../../../FoeHelper/FoeAttack/FoEAutoAttack';
import { FoEAutoExp } from '../../../FoeHelper/FoeAttack/FoeAutoExp';
const windowstyle = {
    width: 370,
    height: 300,
}

export default function AttackWindow({open,setOpen}) {  
    const [autoExp, setautoExp] = useState(FoEAutoExp.autoExpedition);
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
                    onClick={async ()=> await FoEPlayerUtils.MotivateNeighbors()} >Attack GBG</button>
                <Input label={'Num. attacks'} 
                    min={1} style={{width:85}}
                    value={130} 
                    onChange={(e)=>FoEPlunder.plunderMinAmount = e}/>
            </div>
            <Checkbox label={'Auto Expedition'}
                onChanged={(e)=> FoEAutoExp.autoExpedition = e}
                checked={autoExp}/>  
        </ModalWindow>
    )
}
