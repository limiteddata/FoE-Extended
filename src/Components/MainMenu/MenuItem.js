
import React, { useEffect, useState } from 'react';

import './MainMenu.scss'
import MenuButton from './MenuButton';

function MenuItem({name,icon,component}) {
    const [openModal,setOpenModal] = useState(false);
 
    return(
        <>
            <MenuButton name={name} icon={icon} onButtonClick={()=> setOpenModal(!openModal)}/>
            {
                openModal && <component.type {...component.props} open={openModal} setOpen={(value)=>setOpenModal(value)}/>
            }
        </>
    )
}

export default MenuItem