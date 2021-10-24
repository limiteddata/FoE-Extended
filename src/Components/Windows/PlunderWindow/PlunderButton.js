import React from 'react'
import './PlunderWindow.scss';

export default function PlunderButton({onClick}) {
    return (
        <img 
            className='stealButton'
            onClick={onClick}
            src={`https://foero.innogamescdn.com/assets/city/gui/citymap_icons/plunder_hand.png`} 
            alt='steal' />
    )
}
