import React, { useContext, useEffect, useState }from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';

import { FoEconsole } from '../../../FoeHelper/Foeconsole/Foeconsole';

export default function Window4({open,setOpen}) {
    const [logs, setlogs] = useState('')
    useEffect(() => {
        const updatelogs = (e)=>setlogs(e)
        FoEconsole.on('onNewLog',updatelogs);
        return () => {
            //cleanup
            FoEconsole.off('onNewLog',updatelogs)
        }
    }, [])
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
                FoEconsole.console('cacat','test','plm');
            }}>Test</button>
            <p>
            {
                logs
            }
            </p>
        </ModalWindow>
    )
}
