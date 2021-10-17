import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import ModalWindow from '../../ModalWindow/ModalWindow';
import TabNavigation from '../../TabNavigation/TabNavigation';

import URLResolver from '../../../../utils/URLResolver';
const icon1 = URLResolver('/src/assets/img/icon1.png')
const icon2 = URLResolver('/src/assets/img/icon-128.png')

export default function Window1({open,setOpen}) {
    return(
        <ModalWindow
        title={'Army Menu'}
        initialWidth={400}
        initialHeight={350}
        minWidth={120}
        minHeight={80}
        openWindow={open}
        closeWindow={()=>setOpen(false)}>
            <TabNavigation>
                <div label="Attack" icon={icon1}>
                    <div >
                        <p>Attack</p>
                    </div>
                </div>
                <div label="Tab2" icon={icon2}>
                    <div>
                        <p>Tab1</p>
                    </div>
                </div>

            </TabNavigation>
        </ModalWindow>
  
    )
}
