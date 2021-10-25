import React from 'react'
import { urlResolver } from '../../FoeHelper/URLResolver'
import '../../styles/App.scss'
import MainMenu from '../../Components/MainMenu/MainMenu';
import MenuItem from '../../Components/MainMenu/MenuItem';
import ArmyWindow from '../../Components/Windows/ArmyWindow/ArmyWindow';
import Window4 from '../../Components/Windows/Window4/Window4';
import ConsoleWindow from '../../Components/Windows/ConsoleWindow/ConsoleWindow';
import MotivateWindow from '../../Components/Windows/MotivateWindow/MotivateWindow';
import PlunderWindow from '../../Components/Windows/PlunderWindow/PlunderWindow';
import GBWindow from '../Windows/GBWindow/GBWindow';

const armyicon = urlResolver.resolve('/src/assets/img/icon_armyManagement.png')
const terminal = urlResolver.resolve('/src/assets/img/terminal.png')
const motivate = urlResolver.resolve('/src/assets/img/motivate.png')
const plunder = urlResolver.resolve('/src/assets/img/steal.png')
const attack = urlResolver.resolve('/src/assets/img/attack.png')
const gb = urlResolver.resolve('/src/assets/img/great_building.png')

export default function FoeMainMenu() {
    return (
        <MainMenu>    
            <MenuItem
                name={'Console'}
                icon={terminal}
                component={<ConsoleWindow/>}/>             
            <MenuItem
                name={'Army Management'}
                icon={armyicon}
                component={<ArmyWindow/>}/> 
            <MenuItem
                name={'Motivate/Tavern'}
                icon={motivate}
                component={<MotivateWindow/>}/>        
            <MenuItem
                name={'Plunder Menu'}
                icon={plunder}
                component={<PlunderWindow/>}/>     
            <MenuItem
                name={'GB Menu'}
                icon={gb}
                component={<GBWindow/>}/>    
            <MenuItem
                name={'Untitled Menu'}
                icon={attack}
                component={<Window4/>}/>    
        </MainMenu> 
    )
}
