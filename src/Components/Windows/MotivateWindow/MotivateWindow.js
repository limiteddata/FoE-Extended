import React, { useEffect,useState } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './MotivateWindow.scss';
import { FoEPlayers } from '../../../FoeHelper/FoEPlayers/FoEPlayers';
import { FoEconsole } from '../../../FoeHelper/Foeconsole/Foeconsole';
export default function MotivateWindow({open,setOpen}) {

    return(
        <ModalWindow title={'Motivate/Tavern'} initialWidth={360} initialHeight={150} minWidth={220} minHeight={100} 
        center={true} openWindow={open} closeWindow={()=>setOpen(false)}>
            <div>
                <div style={{display:'flex', flexDirection:'row', margin:10}}>
                    <button onClick={async ()=>await FoEPlayers.MotivateNeighbors()} >Motivate Neighbors</button>
                    <button onClick={async ()=> await FoEPlayers.MotivateClanMembers()}>Motivate Clan</button>
                    <button onClick={async ()=> await FoEPlayers.MotivateFriends()}>Motivate Friends</button>
                    <button onClick={async ()=> await FoEPlayers.MotivateFriends()}>Remove inactive Friends</button>
                </div>

                <div style={{display:'flex', flexDirection:'row', margin:10}}>
                    <button onClick={async ()=> await FoEPlayers.CollectTavern()}>Collect Tavern</button>
                    <button onClick={async ()=> await FoEPlayers.seatToTavernsMain()}>Seat to taverns</button>
                </div>
                
                <i>Auto Tavern</i><input type='checkbox' />
                <i>Auto Motivate Neighbors</i><input type='checkbox' />
                <i>Auto Motivate Clan</i><input type='checkbox' />
                <i>Auto Motivate Friends</i><input type='checkbox' />
            </div>
        </ModalWindow>
    )
}
