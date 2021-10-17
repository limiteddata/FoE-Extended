import React, {useState} from 'react'
import ArmyUnit from './ArmyUnit'
import { v4 as uuid} from 'uuid';

function ArmyContainer({army, style, unitSelected, setPos, remove}) {
    return (
        <div className='armyItem' style={style}>
            {
                remove && <span className='removeBtn' onClick={()=>remove()}></span>
            } 
            <div className='armyContent'>
                {
                    army.map((unit,i)=> 
                        <ArmyUnit
                            key={uuid()}
                            unit={unit}
                            small={true}
                            onSelect={(e)=>unitSelected(e,i)}/>)                    
                }
            </div>
            {
                setPos &&            
                <div>
                    <div className='selbutton' onClick={()=>setPos(-1)}></div>
                    <div className='selbutton selbtndown' onClick={()=>setPos(1)}></div>
                </div>
            }
        </div>
    )
}


export default function ArmyShowcase({armys, saveArmy, saveUnitSelected, onRemove, onMove, onNewArmy}) {
    const [state, setstate] = useState(false)
    return (
        <div className='showcaseWrapper'>
            <span className={`attackbtn ${ state ?'attackbtnselected':''}`} onClick={()=>{ onNewArmy(!state); setstate(e=>!e); }} ></span>
            <div className='armyWrapper'>
                {
                    armys.map((army,i)=>{
                        return <ArmyContainer 
                                setPos={(to)=>onMove(i, i+to)}
                                remove={()=>onRemove(i)}
                                key={uuid()} 
                                army={army} />
                    })
                }
                {
                    state && <ArmyContainer 
                            unitSelected={(e,i)=>saveUnitSelected(e,i)}
                            army={saveArmy} />
                }
            </div>
        </div>
    )
}
