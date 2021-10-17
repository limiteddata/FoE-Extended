
import React, { useRef, useEffect, useState } from 'react';
import './MainMenu.scss'

const MainMenu = ({children})=>{
    const [top, setTop] = useState(0);
    const [needtoScroll, setNeedtoScrol] = useState(0);

    const contentRef = useRef(null);
    const moveUp = ()=>{
        if(top === 0) return;
        setTop(top+56);
    } 
    const moveDown = ()=>{
        if (needtoScroll > 0 || top == needtoScroll) return;
        setTop(top-56);
    } 
    useEffect(() => {
        if(children){
            const windowHeight = contentRef.current.getBoundingClientRect().height;
            setNeedtoScrol( windowHeight - (children.length*56) );
        }

    }, [contentRef.current])
    return(
        <div className='container'>
            <span className={`navbutton upbutton ${top!==0? 'active':''}`} onClick={moveUp} ></span>  
            <div className='content' ref={contentRef}>
                <div className='slider' style={{top:top}}>
                    {children}
                </div>
            </div>
            <span className={`navbutton downbutton ${(needtoScroll < 0 && top != needtoScroll)?'active':''}`} onClick={moveDown}></span>
        </div>
    )
}
export default  MainMenu ;
