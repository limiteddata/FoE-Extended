import React from 'react'

export default function GBuilding({name}) {
    const fullPath = `https://foero.innogamescdn.com/assets/shared/gui/greatbuildings/${name}.jpg`    
    return (
        <img src={fullPath} alt={name}/>
    )
}
