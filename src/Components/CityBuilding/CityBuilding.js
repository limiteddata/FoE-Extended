import React from 'react'

export default function CityBuilding({name,width,height}) {
    const baseName = name.substr(name.indexOf('_')+1);
    const basePath = name.substr(name.indexOf('_')-1,1);
    const fullPath = `https://foero.innogamescdn.com/assets/city/buildings/${basePath}_SS_${baseName}.png`    
    return (
        <img src={fullPath} alt={baseName} width={width} height={height}/>
    )
}
