import React, { useContext, useEffect, useState }from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import Input from '../../Input/Input';
import { FoEPlayers } from '../../../FoeHelper/FoEPlayers/FoEPlayers';

const windowstyle={
    width: 350,
    height: 250
}

export default function Window4({open,setOpen}) {
    return(
        <ModalWindow title={'Options Menu'} windowstyle={windowstyle} openWindow={open}closeWindow={()=>setOpen(false)}>
            <Input 
                label={'Ignore players'}
                style={{width:92}}
                type={'text'}
                placeholder={'playername, ...'}
                value={FoEPlayers.ignorePlayers} 
                onChange={(e)=> FoEPlayers.ignorePlayers = e}/>   
        </ModalWindow>
    )
}
