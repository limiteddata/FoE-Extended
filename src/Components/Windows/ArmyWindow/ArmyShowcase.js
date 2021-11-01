import React, {useState} from 'react'
import ArmyUnit from './ArmyUnit'
import { v4 as uuid} from 'uuid';

function ArmyContainer({army, typeGvG,style, unitSelected, armySelected, setPos, remove}) {
    const renderArmy = typeGvG ? army.army: army;
    return (
        <div className='armyItem' style={style} onClick={()=>armySelected(army)}>
            {
                remove && <span className='removeBtn' onClick={(e)=>{e.stopPropagation(); remove() }}></span>
            } 
            <div className='armyContent'>
                {
                    renderArmy.map((unit,i)=> 
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
                    <div className='selbutton' onClick={(e)=>{e.stopPropagation(); setPos(-1)}}></div>
                    <div className='selbutton selbtndown' onClick={(e)=>{e.stopPropagation(); setPos(1)}}></div>
                </div>
            }
            {
                typeGvG && army.era
            }
            
        </div>
    )
}


export default function ArmyShowcase({armys, typeGvG, saveArmy, saveUnitSelected, armySelected,  onRemove, onMove, onNewArmy}) {
    const [state, setstate] = useState(false)

    return (
        <div className='showcaseWrapper'>
            <span className={`${typeGvG?'typeGvG':'attackbtn'} ${ state ? ( typeGvG? 'typeGvGselected':'attackbtnselected'): '' }`} onClick={()=>{ onNewArmy(!state); setstate(e=>!e); }} ></span>
            <div className='armyWrapper'>
                {
                    armys.map((army,i)=>{
                        return <ArmyContainer 
                                setPos={(to)=>onMove(i, i+to)}
                                remove={()=>onRemove(i)}
                                key={uuid()} 
                                armySelected={(unit)=>armySelected(unit)}
                                typeGvG={typeGvG}
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
