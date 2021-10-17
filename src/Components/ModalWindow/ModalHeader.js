import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';

export default function ModalHeader({headerTitle, settings, windowRef, onCloseWindow }) {
    const [mouseDown, setMouseDown] = useState(false);
    const bringToFront = ()=>{
      let elements = document.getElementsByClassName('focus');
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('focus');
        
      }
      windowRef.current.classList.add("focus");
    }
    const handleMouseDown = ()=>{
      bringToFront();
      setMouseDown(true);
    }
    useEffect(() => {
      const handleMouseUp = () => setMouseDown(false);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);
    
    useEffect(() => {

      const ratio = window.devicePixelRatio
        
      const handleMouseMove = (e) => {
        const panel = windowRef.current;
        if (!panel) return;
        
        const { x, y,} = panel.getBoundingClientRect();

        const posX = x + (e.movementX / ratio);
        const posY = y + (e.movementY / ratio);
        
        if(posX < 0 || posY < 0 ) {
            setMouseDown(false);
            return;
        }

        panel.style.left = `${posX}px`;
        panel.style.top = `${posY}px`;
      };
  
      if (mouseDown) 
        window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, [mouseDown]);

    return(
        <div className={`window-header`} onMouseDown={handleMouseDown}>
            <p className={'header-title'}>{headerTitle}</p>
            <div className={'header-inlinebuttons'}>
              { settings && <div className={'header-button settings-button'} onClick={settings}></div> }
              <div className={'header-button close-button marginRight'} onClick={onCloseWindow}></div>
            </div>
        </div>
  
    )
}
