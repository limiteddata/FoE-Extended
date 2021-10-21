
import React, { useEffect, useState } from 'react';

import './MainMenu.scss'
import MenuButton from './MenuButton';
import { useLocalState } from '../../hooks/useLocalState';
function MenuItem({name,icon,component}) {
    const [openModal,setOpenModal] = useLocalState(false,`openModal${name}`);
    return(
        <>
            <MenuButton name={name} icon={icon} active={openModal} onButtonClick={()=> setOpenModal(!openModal)}/>
            {
                openModal && <component.type {...component.props} open={openModal} setOpen={(value)=>setOpenModal(value)}/>
            }
        </>
    )
}

export default MenuItem