import React, { useContext }from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import { FoERequest } from '../../../FoeHelper/FoeRequest';
import { armyManagement } from '../../../FoeHelper/ArmyManagement/ArmyManagement';
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
                //console.log(FoeHelper.ArmyManagement)
                // let request = [{"__class__":"ServerRequest","requestData":[{"__class__":"ArmyContext","content":"main"}],"requestClass":"ArmyUnitManagementService","requestMethod":"getArmyInfo"}]
                //console.log( await armyManagement.getArmyType() );
                console.log(armyManagement)
            }}>Test</button>
        </ModalWindow>
    )
}
