import React, { useState, useEffect,useRef } from 'react'
import ArmyUnit from './ArmyUnit'
import { v4 as uuid} from 'uuid';
import { ages } from '../../../FoeHelper/ArmyManagement/items';
import Dropdown from 'react-dropdown';
import { armyManagement } from '../../../FoeHelper/ArmyManagement/ArmyManagement';

export const ArmyPool = React.memo( ({unassignedArmy,defendingArmy, onUnitSelected}) => {
    const contentRef = useRef()
    const [activeTab, setActiveTab] = useState('units_all');
    const [age, setAge] = useState('AllAge');
    const changeActiveTab = (tab)=>{
        setActiveTab(tab);
    }
    
    function filterArmy() {

        unassignedArmy = [...defendingArmy, ...unassignedArmy]
        let filtered = [];
        for (let i = 0; i < unassignedArmy.length; i++) {
            if(unassignedArmy[i].isArenaDefending) continue;
            if( activeTab !== 'units_all' && 
                armyManagement.armyTypes[unassignedArmy[i].unitTypeId].unitClass !== activeTab ) continue;
            if(age !==  "AllAge" &&  armyManagement.armyTypes[unassignedArmy[i].unitTypeId].minEra !== age ) continue;
            filtered.push(unassignedArmy[i]);
        }
        return filtered;
    }
    const currentUnits = filterArmy()
    useEffect(() => {
        contentRef.current.onwheel = (evt) => {
            evt.preventDefault();
            contentRef.current.scrollLeft += evt.deltaY;
        };
    }, [contentRef])


    return (
        <div className={'poolWrapper'}>   
            <ol className="poolHeader">
                <TabItem label={'units_all'} activeTab={activeTab} onClick={changeActiveTab} />
                <TabItem label={'fast'} activeTab={activeTab} onClick={changeActiveTab} />
                <TabItem label={'heavy_melee'} activeTab={activeTab} onClick={changeActiveTab}/>
                <TabItem label={'light_melee'} activeTab={activeTab} onClick={changeActiveTab}/>
                <TabItem label={'long_ranged'} activeTab={activeTab} onClick={changeActiveTab}/>
                <TabItem label={'short_ranged'} activeTab={activeTab} onClick={changeActiveTab}/>
                <Dropdown options={ages} onChange={(e)=>setAge(e.value)} value={age} />
            </ol> 
            <div className={'poolContent'} ref={contentRef}>
                {      
                    currentUnits.map((unit)=>    
                        <ArmyUnit
                            key={uuid()}
                            unit={unit}
                            onSelect={e=> onUnitSelected(e) }/>) 
                }
            </div>

            </div> 
    )
})

function TabItem({label, activeTab, onClick}) {
    const url = 'https://foero.innogamescdn.com/assets/shared/gui/armyunitmanagement/';
    return (
        <li className={'poolTab'} 
            style={{backgroundImage:label===activeTab?`url(${url}army_active_tab.png)`:`url(${url}army_inactive_tab.png)`}}
            onClick={()=>onClick(label)}>
            <img src={`https://foero.innogamescdn.com/assets/shared/icons/${label}.png`} alt={label} />
        </li>
    )
}
