
import React, { useState } from 'react';
import './MainMenu.scss'

export default function MenuButton({name,icon, active, onButtonClick}) {
    return(
        <>  
            <div className={`item ${active?'itemActive':''}`} title={name} onClick={onButtonClick}>
                <img src={icon} alt='icon'/>
            </div>
        </>
    )
}
