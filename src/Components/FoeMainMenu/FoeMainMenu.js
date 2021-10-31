import React from 'react'
import { urlResolver } from '../../FoeHelper/URLResolver'
import '../../styles/App.scss'
import MainMenu from '../../Components/MainMenu/MainMenu';
import MenuItem from '../../Components/MainMenu/MenuItem';
import ArmyWindow from '../../Components/Windows/ArmyWindow/ArmyWindow';
import ConsoleWindow from '../../Components/Windows/ConsoleWindow/ConsoleWindow';
import MotivateWindow from '../../Components/Windows/MotivateWindow/MotivateWindow';
import PlunderWindow from '../../Components/Windows/PlunderWindow/PlunderWindow';
import GBWindow from '../Windows/GBWindow/GBWindow';
import AttackWindow from '../Windows/AttackWindow/AttackWindow';
import OptionsWindow from '../Windows/OptionsWindow/OptionsWindow';
const armyicon = urlResolver.resolve('/src/assets/img/icon_armyManagement.png')
const terminal = urlResolver.resolve('/src/assets/img/terminal.png')
const motivate = urlResolver.resolve('/src/assets/img/motivate.png')
const plunder = urlResolver.resolve('/src/assets/img/steal.png')
const attack = urlResolver.resolve('/src/assets/img/attack.png')
const gb = urlResolver.resolve('/src/assets/img/great_building.png')
const Options = urlResolver.resolve('/src/assets/img/options.png')

export default function FoeMainMenu() {
    return (
        <MainMenu>  
            <MenuItem
                name={'Options Menu'}
                icon={Options}
                component={<OptionsWindow/>}/>             
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
                name={'Attack Menu'}
                icon={attack}
                component={<AttackWindow/>}/>    
            <MenuItem
                name={'Console'}
                icon={terminal}
                component={<ConsoleWindow/>}/>        
        </MainMenu> 
    )
}
