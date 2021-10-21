import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { useLocalState } from '../../hooks/useLocalState';

export default function ModalHeader({headerTitle, settings, windowRef, onCloseWindow }) {
    
    const [lastPosition, setlastPosition] = useLocalState({top:200,left:200},`lastPos_${headerTitle}`);

    const [mouseDown, setMouseDown] = useState(false);
    const bringToFront = ()=>{
      let elements = document.getElementsByClassName('focus');
      for (let i = 0; i < elements.length; i++) elements[i].classList.remove('focus');
      windowRef.current.classList.add("focus");
    }
    const handleMouseDown = ()=>{
      bringToFront();
      setMouseDown(true);
    }

    useEffect(() => {
      //handle init 
      const panel = windowRef.current;
      if (!panel) return;
      panel.style.left = lastPosition.left;
      panel.style.top = lastPosition.top;
      const handleMouseUp = () => {
        setMouseDown(false);
        setlastPosition({top:panel.style.top,left:panel.style.left})
      }
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
