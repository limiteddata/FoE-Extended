import React, {useContext} from 'react'
import { v4 as uuid} from 'uuid';
import { spriteResolver } from '../../../FoeHelper/SpriteResolver';


export default function ArmyUnit({unit, small,onSelect}) {
    const unitIcon = spriteResolver.getIcon('shared/unit_portraits/armyuniticons_50x50/armyuniticons_50x50_0',`armyuniticons_50x50_${unit.unitTypeId}`)
    let health = [];
    for (let i = 1; i <= 10; i++) {
        health.push(<div key={uuid()} className={`healthPoint ${i>unit.currentHitpoints?'healthRed':unit.is_defending?'healthBlue':'healthGreen'}`}></div>)
    }
    return (
        <div className={`unitFrame ${unit.is_defending?'blueBorder':''}`} style={small&&{zoom:0.7}} onClick={()=>onSelect(unit)}>
            <div className={'frameContainer'}>
                <div style={unitIcon}></div>
                {
                    small ||
                    <div className={'healthbar'}>
                        { health  }
                    </div>
                }
            </div>
        </div>
    )
}