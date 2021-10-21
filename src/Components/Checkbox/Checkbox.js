
import React, { useState, } from 'react';
import './Checkbox.scss';

export default function Checkbox({label, checked,onChanged }) {
    const [state, setstate] = useState(checked?checked:false)
    return(
        <div className='checkboxBody' onClick={()=>{
            onChanged && onChanged(!state);
            setstate(oldstate=>{
                const newState = !oldstate;
                return newState;
            })}}>
            <div className='checkboxLabel'>{label}</div>
            { 
                state && <div className='checkboxCheck'></div> 
            }
        </div>
    )
}
