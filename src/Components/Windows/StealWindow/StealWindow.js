import React, { useEffect,useState } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './StealWindow.scss';
import { FoEPlayers } from '../../../FoeHelper/FoEPlayers/FoEPlayers';
import { FoEconsole } from '../../../FoeHelper/Foeconsole/Foeconsole';

export default function StealWindow({open,setOpen}) {

    return(
        <ModalWindow title={'Steal Menu'} initialWidth={360} initialHeight={150} minWidth={220} minHeight={100} 
        center={true} openWindow={open} closeWindow={()=>setOpen(false)}>

        </ModalWindow>
    )
}
