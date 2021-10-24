import React from 'react'
import './StealWindow.scss';

export default function StealButton({onClick}) {
    return (
        <img 
            className='stealButton'
            onClick={onClick}
            src={`https://foero.innogamescdn.com/assets/city/gui/citymap_icons/plunder_hand.png`} 
            alt='steal' />
    )
}
