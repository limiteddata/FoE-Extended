import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.scss'
import ModalHeader from './ModalHeader';
import ResizerWindow from './ResizerWindow';

export default function ModalWindow({title, settings, center, initialWidth, initialHeight, initialX, initialY, minWidth, minHeight, openWindow,closeWindow,children}) {
    const panelRef = useRef(null);

    const elements = document.getElementsByClassName('focus');
    while(elements.length > 0){
        elements[0].classList.remove('focus');
    }
    return createPortal(
        <>   
            <div className={`window-body ${openWindow?'focus':''}`} style={{
                width: initialWidth, 
                height: initialHeight,
                top: initialY?initialY:center&&(window.innerHeight-initialHeight)/2, 
                left: initialX?initialX:center&&(window.innerWidth-initialWidth)/2, 
                }} ref={panelRef}>
                <ModalHeader
                    settings={settings}
                    headerTitle={title}
                    onCloseWindow={closeWindow}
                    windowRef={panelRef}/>
    
                <ResizerWindow
                    minWidth = {minWidth}
                    minHeight = {minHeight}
                    windowRef={panelRef}/>
                <div style={{width:'100%',height:'100%'}}>
                    <div className={'window-content'}>
                        { children }
                    </div>    
                </div>
            </div>
        </>
    ,document.getElementById('modalContent'))
}
