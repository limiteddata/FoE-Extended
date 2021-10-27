import React from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './MotivateWindow.scss';
import { FoEPlayerUtils } from '../../../FoeHelper/FoEPlayers/FoePlayerUtils';
import { FoEAutoMPT } from '../../../FoeHelper/FoEPlayers/AutoMPT';
import Checkbox from '../../Checkbox/Checkbox';
const windowstyle={
    width: 350,
    height: 355
}
export default function MotivateWindow({open,setOpen}) {

    return(
        <ModalWindow title={'Motivate/Tavern'} windowstyle={windowstyle} openWindow={open} closeWindow={()=>setOpen(false)}>
            <div id='autoContent'>
                <div className='flexRow'>
                    <button className='orange-button' 
                    onClick={async ()=> await FoEPlayerUtils.MotivateNeighbors()} >Motivate Neighbors</button>
                    <Checkbox label={'Auto M/P Neighbors'}
                        onChanged={(e)=> FoEAutoMPT.autoMotivateNeighbors = e}
                        checked={FoEAutoMPT.autoMotivateNeighbors}/>
                </div>
                <div className='flexRow'>
                    <button className='orange-button'
                    onClick={async ()=> await FoEPlayerUtils.MotivateClanMembers()}>Motivate Clan</button>
                    <Checkbox label={'Auto M/P Clan'}
                        onChanged={(e)=> FoEAutoMPT.autoMotivateClanMembers = e}
                        checked={FoEAutoMPT.autoMotivateClanMembers}/>
                </div>
                <div className='flexRow'>
                    <button className='orange-button'
                    onClick={async ()=> await FoEPlayerUtils.MotivateFriends()}>Motivate Friends</button>
                    <Checkbox label={'Auto M/P Friends'}                        
                        onChanged={(e)=> FoEAutoMPT.autoMotivateFriends = e}
                        checked={FoEAutoMPT.autoMotivateFriends}/>
                </div>
                <div className='flexRow'>
                    <button className='orange-button'
                    onClick={async ()=> await FoEPlayerUtils.seatToAllTaverns()}>Seat to taverns</button>
                    <Checkbox label={'Auto Tavern'} 
                        onChanged={(e)=> FoEAutoMPT.autoTavern = e}
                        checked={FoEAutoMPT.autoTavern}/>
                </div>
                <button className='orange-button'
                onClick={async ()=> await FoEPlayerUtils.removeInactivePlayers()}>Remove Inactive</button>
                <button className='orange-button'
                onClick={async ()=> await FoEPlayerUtils.CollectTavern()}>Collect Tavern</button>
            </div>
        </ModalWindow>
    )
}
