import React, { useContext, useEffect, useState }from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';

import { requestJSON } from '../../../FoeHelper/Utils';
import { FoERequest } from '../../../FoeHelper/FoeRequest';
export default function Window4({open,setOpen}) {

    return(
        <ModalWindow
            title={'Modal Menu'}
            initialWidth={400}
            initialHeight={350}
            minWidth={120}
            minHeight={80}
            settings={()=>alert('open settings window')}
            openWindow={open}
            closeWindow={()=>setOpen(false)}>

            <button onClick={async ()=>{
                const request = requestJSON("OtherPlayerService","getFriendsList");
                let response = await FoERequest.FetchRequestAsync(request,0);
                console.log(response)
            }}>test</button>

        </ModalWindow>
    )
}
