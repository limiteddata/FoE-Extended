
import React, { useState } from 'react';
import './MainMenu.scss'

export default function MenuButton({name,icon, onButtonClick}) {
    return(
        <>  
            <div className='item' title={name} onClick={onButtonClick}>
                <img src={icon} alt='icon'/>
            </div>
        </>
    )
}
