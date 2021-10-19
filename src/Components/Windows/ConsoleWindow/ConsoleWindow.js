import React, { useEffect,useState, useRef } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import './ConsoleWindow.scss';
import { FoEconsole } from '../../../FoeHelper/Foeconsole/Foeconsole';

export default function ConsoleWindow({open,setOpen}) {
    const [logs, setlogs] = useState(FoEconsole.getLogs())
    const reftextarea = useRef();
    const styles = {
        height: '100%',
        justifyContent: 'center',
    }
      
    useEffect(() => {
        // on window mount
        const updatelogs = (e)=> setlogs(e);
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
        <ModalWindow title={'Console'} initialWidth={360} initialHeight={150} minWidth={220} minHeight={100} 
        center={true} openWindow={open} closeWindow={()=>setOpen(false)} styles={styles}>
            <textarea ref={reftextarea} className='consoleContainer' rows="4" cols="65" defaultValue={logs}></textarea>            
        </ModalWindow>
    )
}
