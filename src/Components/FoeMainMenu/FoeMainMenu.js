import React from 'react'
import { urlResolver } from '../../FoeHelper/URLResolver'
import '../../styles/App.scss'
import MainMenu from '../../Components/MainMenu/MainMenu';
import MenuItem from '../../Components/MainMenu/MenuItem';
import ArmyWindow from '../../Components/Windows/ArmyWindow/ArmyWindow';
import Window1 from '../../Components/Windows/Window1/Window1';
import ConsoleWindow from '../../Components/Windows/ConsoleWindow/ConsoleWindow';
import MotivateWindow from '../../Components/Windows/MotivateWindow/MotivateWindow';
import StealWindow from '../../Components/Windows/StealWindow/StealWindow';

const armyicon = urlResolver.resolve('/src/assets/img/icon_armyManagement.png')
const terminal = urlResolver.resolve('/src/assets/img/terminal.png')
const motivate = urlResolver.resolve('/src/assets/img/motivate.png')
const steal = urlResolver.resolve('/src/assets/img/steal.png')
const attack = urlResolver.resolve('/src/assets/img/attack.png')

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
                name={'Steal Menu'}
                icon={steal}
                component={<StealWindow/>}/>    
            <MenuItem
                name={'Attack Menu'}
                icon={attack}
                component={<Window1/>}/>    
            <MenuItem
                name={'Production Menu'}
                icon={attack}
                component={<Window1/>}/>    
        </MainMenu> 
    )
}
