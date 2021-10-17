import React, { useState, useContext } from 'react';
import { render } from 'react-dom';
import '../../styles/App.scss'
import MainMenu from '../../Components/MainMenu/MainMenu';
import MenuItem from '../../Components/MainMenu/MenuItem';
import ArmyWindow from '../../Components/Windows/ArmyWindow/ArmyWindow';
import Window4 from '../../Components/Windows/Window4/Window4';
import { urlResolver } from '../../FoeHelper/URLResolver'

const armyicon = urlResolver.resolve('/src/assets/img/icon_armyManagement.png')

function Foreground() {   
    return (          
        <MainMenu>   
            <MenuItem
                name={'Army Management'}
                icon={armyicon}
                component={<ArmyWindow/>}/>             
            <MenuItem
                name={'Army Management'}
                icon={''}
                component={<Window4/>}/>   
        </MainMenu> 
    )
}

export default Foreground;


render(<Foreground />, document.querySelector('#foreground'));