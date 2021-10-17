import React, { useEffect,useState, useCallback } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import TabNavigation from '../../TabNavigation/TabNavigation';
import { ArmyPool } from './ArmyPool';
import './ArmyWindow.scss';
import { armyManagement } from '../../../FoeHelper/ArmyManagement/ArmyManagement';
import ArmyShowcase from './ArmyShowcase';
import {arrayMoveImmutable} from 'array-move';

export default function ArmyWindow({open,setOpen}) {
    const [armyPool, setarmyPool] = useState(armyManagement.ArmyPool)

    const [attackArmy, setattackArmy] = useState(armyManagement.attackArmy);
    const [gvgArmy, setgvgArmy] = useState(armyManagement.gvgArmy);

    
    useEffect(() => {
        // on window mount
        const updateArmy = army => setarmyPool(army)
        armyManagement.on('ArmyPoolCanged',updateArmy);
        armyManagement.getArmyInfo();
        return () => {
            //cleanup
            armyManagement.off('ArmyPoolCanged',updateArmy)
        }
    }, [])
    const [saveArmy, setsaveArmy] = useState([])
    const handleUnitSelect = useCallback((e) => {
            setsaveArmy(last=>{
                if(last.length === 8) return [...last]
                return [...last,e]
            })
    },[]) 
    const updateSaveArmy = (e,i)=>{
        saveArmy.splice(i,1);
        setsaveArmy([...saveArmy])
    }
    return(
        <ModalWindow title={'Army Management'} initialWidth={690} initialHeight={490} minWidth={300} minHeight={200} 
        center={true} openWindow={open} closeWindow={()=>setOpen(false)}>
            <TabNavigation>
                <div label="Attack Army">
                    <ArmyShowcase 
                        onRemove={index=> {
                            armyManagement.attackArmy.splice(index,1) ;
                            setattackArmy(armyManagement.attackArmy) 
                        }}
                        onMove={(from, to)=>{
                            if(to < 0 || to > attackArmy.length) return;
                            armyManagement.attackArmy = arrayMoveImmutable(attackArmy, from, to);
                            setattackArmy(armyManagement.attackArmy) 
                        }}
                        onNewArmy={(e)=>{
                                // clear
                                if(e) setsaveArmy([])
                                // append
                                else
                                    if(saveArmy.length > 0) {
                                        armyManagement.attackArmy = [...attackArmy,saveArmy];
                                        setattackArmy(armyManagement.attackArmy) 
                                    }                              
                        }}
                        saveUnitSelected={updateSaveArmy}
                        armys={attackArmy}
                        saveArmy={saveArmy}/>
                </div>
                <div label="GvG Army">
                    <ArmyShowcase 
                        onRemove={index=> {
                            armyManagement.gvgArmy.splice(index,1);
                            setgvgArmy(armyManagement.gvgArmy) 

                        }}
                        onMove={(from, to)=>{
                            if(to < 0 || to > gvgArmy.length) return;
                            armyManagement.gvgArmy = arrayMoveImmutable(gvgArmy, from, to);
                            setgvgArmy(armyManagement.gvgArmy)
                        }}
                        onNewArmy={(e)=>{
                                // clear
                                if(e) setsaveArmy([])
                                //append
                                else
                                    if(saveArmy.length > 0) {
                                        armyManagement.gvgArmy = [...gvgArmy,saveArmy];
                                        setgvgArmy(armyManagement.gvgArmy)
                                    }                            
                        }}
                        saveUnitSelected={updateSaveArmy}
                        armys={gvgArmy}
                        saveArmy={saveArmy}/>
                </div>
            </TabNavigation>
            <ArmyPool 
            onUnitSelected={handleUnitSelect}
            defendingArmy={armyPool.defendingArmy}
            unassignedArmy={armyPool.unassignedArmy}/>

        </ModalWindow>
    )
}
