import React, { useEffect, useState, useRef } from 'react';
import { render } from 'react-dom';

export default function ResizerWindow({ windowRef, minWidth = 250, minHeight = 150 }) {
    const [mouseDown, setMouseDown] = useState(false);

    useEffect(() => {
      const handleMouseMove = (e) => {  
        const panel = windowRef.current;
        if (!panel) return;

        const ratio = window.devicePixelRatio

        const { width, height } = getComputedStyle(panel);

        const newWidth = parseInt(width,10) + (e.movementX / ratio);
        const newHeight = parseInt(height,10) + (e.movementY / ratio);

        if(newWidth < minWidth || newHeight < minHeight){
            setMouseDown(false);
            return;
        }
        panel.style.width = `${newWidth}px`;
        panel.style.height = `${newHeight}px`;
      };
      if (mouseDown) 
        window.addEventListener('mousemove', handleMouseMove); 
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, [mouseDown]);
  
    useEffect(() => {
      const handleMouseUp = () => setMouseDown(false);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    return(
        <div className="right-bottom" onMouseDown={()=>setMouseDown(true)}></div>
    )
}
