import React, { useEffect,useState, useRef } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './ConsoleWindow.scss';
import { FoEconsole } from '../../../FoeHelper/Foeconsole/Foeconsole';


const windowstyle={
    width: 410, 
    height: 185,
}

const contentstyle = {
    height: '100%',
    justifyContent: 'center',

}
export default function ConsoleWindow({open,setOpen}) {
    let [logs, setlogs] = useState(FoEconsole.getLogs())
    const reftextarea = useRef();
      
    useEffect(() => {
        // on window mount
        const updatelogs = (e)=> setlogs(e)
        FoEconsole.on('logsChanged',updatelogs);
        return () => {
            //cleanup
            FoEconsole.off('logsChanged',updatelogs)
        }
    }, [])
    useEffect(() => {
        reftextarea.current.scrollTop = reftextarea.current.scrollHeight;
    })
    return(
        <ModalWindow title={'Console'} openWindow={open} closeWindow={()=>setOpen(false)} windowstyle={windowstyle} contentstyle={contentstyle}>
            <textarea ref={reftextarea} className='consoleContainer' rows="4" cols="65" value={logs} onChange={e=>{}}></textarea>            
        </ModalWindow>
    )
}
