import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import ModalWindow from '../../ModalWindow/ModalWindow';
import TabNavigation from '../../TabNavigation/TabNavigation';
export default function Window2({open,setOpen}) {
    return(
        <ModalWindow
            title={'Item Menu'}
            initialWidth={400}
            initialHeight={350}
            minWidth={120}
            minHeight={80}
            settings={()=>alert('open settings window')}
            openWindow={open}
            closeWindow={()=>setOpen(false)}>
            <TabNavigation>
                <div label="Attack">
                <div >
                    <p>Attack</p>
                </div>
                </div>
                <div label="Tab2">
                <div>
                    <p>Tab1</p>
                </div>
                </div>
            </TabNavigation>
        </ModalWindow>
    )
}
