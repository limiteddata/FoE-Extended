import React, {useState, useEffect} from 'react'
import { FoECity } from '../../../FoeHelper/FoeProduction/FoeCity'
import SavedBuilding from './SavedBuilding';
import ModalWindow from '../../ModalWindow/ModalWindow';
import CityBuilding from '../../CityBuilding/CityBuilding';
import SimpleCheckbox from '../../SimpleCheckbox/SimpleCheckbox';
import Dropdown from 'react-dropdown';

const windowSize = {
    width: 600,
    height: 500
}
export default function SavedBuildings() {
    const [overridebuildings, setoverridebuildings] = useState(FoECity.manualBuildings);
    const [openWindow, setopenWindow] = useState(false);
    const [selectedBuildings, setSelectedBuildings] = useState([]);
    const [cancelable, setcancelable] = useState(false);
    const [selectedOption, setselectedOption] = useState(1);

    const options = [
        {value:1,label:'5m / 4h'},
        {value:2,label:'15m / 8h'},
        {value:3,label:'1h / 1d'},
        {value:4,label:'4h / 2d'},
        {value:5,label:'8h / 2d'},
        {value:6,label:'24h / 2d'}
    ];
    useEffect(() => {
        const updateBuildings = (e)=> setoverridebuildings(e)
        FoECity.on('buildingsChanged',updateBuildings);
        return () => {
            FoECity.off('buildingsChanged',updateBuildings)
        }
    }, [])

    useEffect(() => {
        if(openWindow === true){
            setSelectedBuildings([]);
            setcancelable(false);
            setselectedOption(1);
        }
    }, [openWindow])
    const checkSelectedBuilding = (bid)=>{
        for (let i = 0; i < selectedBuildings.length; i++) {
            if( selectedBuildings[i].id === bid) return i;
        }
        return -1;
    }
    const saveBuildings = ()=>{
        const newBld = {};
        selectedBuildings.forEach(e=>{
            let opt = selectedOption;
            if(e.type === 'goods' && opt>4) opt = 4;
            newBld[e.id] = {
                "id": e.id,
                "player_id": e.player_id,
                "cityentity_id": e.cityentity_id,
                "type": e.type,
                "cancelable": cancelable,
                "option": opt
            }
        });
        FoECity.manualBuildings = {
            ...FoECity.manualBuildings,
            ...newBld
        }
        setopenWindow(false);
    }
    return (
        <div className='productionWrapper'>
            {
                Object.keys(overridebuildings).map(key=><SavedBuilding building={FoECity.manualBuildings[key]} key={key}/>)
            }

            <div className='addButton addBuilding' onClick={()=>setopenWindow(last=>!last)}></div>

            {
                openWindow &&
            <ModalWindow title={'Buildings Menu'} windowstyle={windowSize} openWindow={openWindow} closeWindow={()=>setopenWindow(false)}>
                <p>Buildings:</p>
                <div className='buildingsWrapper'>
                    {
                        FoECity.entities.filter(e=> 
                            (e.type === 'goods' || e.type === 'production') &&
                            !FoECity.manualBuildings.hasOwnProperty(e.id))
                        .map(building=> 
                        <div key={building.id} className={`selectedItem ${checkSelectedBuilding(building.id)>-1?'selectedBorder':''}`}
                            onClick={()=> {
                                const index = checkSelectedBuilding(building.id);
                                if(index > -1) {
                                    const newBld = [...selectedBuildings];
                                    newBld.splice(index,1);
                                    setSelectedBuildings(newBld);
                                }
                                else setSelectedBuildings(last=>[...last,building])
                            }}>
                            <CityBuilding name={building.cityentity_id} height={45}/>
                        </div>)
                    }
                </div>
                <div className='flexRow'>
                    <Dropdown 
                        options={options} 
                        onChange={(e)=> setselectedOption(e.value)} 
                        value={options[selectedOption-1]}/>
                    <SimpleCheckbox
                        label={'Cancelable'}
                        onChanged={(e)=> setcancelable(e)}
                        checked={cancelable}/>
                    <button className='orange-button' onClick={saveBuildings}>Save</button>
                </div>
            </ModalWindow>
            }

        </div>
    )
}
