import React, { useEffect,useState, useCallback } from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';
import TabNavigation from '../../TabNavigation/TabNavigation';
import { ArmyPool } from './ArmyPool';
import './ArmyWindow.scss';
import { armyManagement } from '../../../FoeHelper/ArmyManagement/ArmyManagement';
import ArmyShowcase from './ArmyShowcase';
import {arrayMoveImmutable} from 'array-move';
import { FoEGVG } from '../../../FoeHelper/FoeAttack/FoeGVG/FoeGVG';
import { toast } from 'react-toastify';

const windowstyle={
    width: 690, 
    height: 500,
}

export default function ArmyWindow({open,setOpen}) {
    const [armyPool, setarmyPool] = useState(armyManagement.ArmyPool)

    const [attackArmy, setattackArmy] = useState(armyManagement.attackArmy);
    const [gvgArmy, setgvgArmy] = useState(armyManagement.gvgArmy);

    
    useEffect(() => {
        // on window mount
        const updateArmy = army => setarmyPool(army)
        armyManagement.on('ArmyPoolChanged',updateArmy);
        armyManagement.updateArmy();
        return () => {
            //cleanup
            armyManagement.off('ArmyPoolChanged',updateArmy)
        }
    }, [])
    const [saveArmy, setsaveArmy] = useState([])
    const handleUnitSelect = useCallback((e) => {
            setsaveArmy(last=>{
                if(last.length === 8) return [...last]
                return [...last,e]
            })
    },[]) 
    return(
        <ModalWindow title={'Army Management'} windowstyle={windowstyle} openWindow={open} closeWindow={()=>setOpen(false)}>
            <TabNavigation>
                <div label="Attack Army">
                    <ArmyShowcase 
                        onRemove={index=> {
                            const newArmy = [...attackArmy];
                            newArmy.splice(index,1) 
                            armyManagement.attackArmy = newArmy;
                            setattackArmy(newArmy) 
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
                                        setattackArmy( armyManagement.attackArmy) 
                                    }                              
                        }}
                        saveUnitSelected={(e,i)=>{
                            saveArmy.splice(i,1);
                            setsaveArmy([...saveArmy])
                        }}
                        armys={attackArmy}
                        saveArmy={saveArmy}
                        armySelected={(e)=>armyManagement.setNewArmy(e) }
                        />
                </div>
                <div label="GvG Army">
                    <ArmyShowcase 
                        typeGvG={true}
                        onRemove={index=> {
                            const newArmy = [...gvgArmy];
                            newArmy.splice(index,1) 
                            armyManagement.gvgArmy = newArmy;
                            setgvgArmy(newArmy) 

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
                                else{
                                    // check army age
                                    if(saveArmy.length === 0) return;
                                    const armyEra = FoEGVG.getEraofArmy(saveArmy);
                                    if(armyEra === null){
                                        toast.error(`Army contains multiple eras`);
                                        return;
                                    }
                                    armyManagement.gvgArmy = [...gvgArmy,{era: armyEra ,army:saveArmy}];
                                    setgvgArmy(armyManagement.gvgArmy)
                                }                         
                        }}
                        saveUnitSelected={(e,i)=>{
                            saveArmy.splice(i,1);
                            setsaveArmy([...saveArmy])
                        }}
                        armys={gvgArmy}
                        saveArmy={saveArmy}
                        armySelected={(e)=>armyManagement.setNewArmy(e.army) }
                        />
                </div>
            </TabNavigation>
            <ArmyPool 
            onUnitSelected={handleUnitSelect}
            defendingArmy={armyPool.defendingArmy}
            unassignedArmy={armyPool.unassignedArmy}/>

        </ModalWindow>
    )
}
