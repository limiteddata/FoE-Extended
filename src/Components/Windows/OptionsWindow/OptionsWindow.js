import React, { useContext, useEffect, useState }from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import Input from '../../Input/Input';
import { FoEPlayers } from '../../../FoeHelper/FoEPlayers/FoEPlayers';
import { FoERequest } from '../../../FoeHelper/FoeRequest';

const windowstyle={
    width: 420,
    height: 250
}

export default function Window4({open,setOpen}) {
    return(
        <ModalWindow title={'Options Menu'} windowstyle={windowstyle} openWindow={open}closeWindow={()=>setOpen(false)}>
            <Input 
                label={'Ignore players'}
                style={{width:160}}
                type={'text'}
                placeholder={'playername, ...'}
                value={FoEPlayers.ignorePlayers} 
                onChange={(e)=> FoEPlayers.ignorePlayers = e}/>   
            <Input 
                label={'Requests delay(ms)'}
                type={'range'}
                style={{width:160}}
                min={0}
                max={5000}
                value={600}
                value={FoERequest.requestsDelay} 
                onChange={(e)=> FoERequest.requestsDelay = e}/> 
            <p style={{fontSize:11}}>Lowering increases the chances of you getting banned.</p>
        </ModalWindow>
    )
}
