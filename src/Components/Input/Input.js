
import React, { useState, } from 'react';
import './Input.scss';

export default function Input({label, value, min, onChange}) {
    const [state, setstate] = useState(value)
    return(
        <div className='inputBody'>
            <div className='inputLabel'>{label}</div>
            <input className='inputContent' 
                value={state} 
                min={min}
                onChange={e=>{
                    onChange(e.target.value);
                    setstate(e.target.value)}} type={'number'} />
        </div>
    )
}
