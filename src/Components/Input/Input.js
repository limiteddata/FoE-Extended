
import React, { useState, } from 'react';
import './Input.scss';

export default function Input({label, value, type, style, placeholder, min, onChange}) {
    const [state, setstate] = useState(value)

    return(
        <div className='inputBody'>
            <div className='inputLabel'>{label}</div>
            <input className='inputContent' 
                style={style}
                type={type}
                value={state} 
                placeholder={placeholder}
                min={min}
                onChange={e=>{
                    onChange(e.target.value);
                    setstate(e.target.value)}} />
        </div>
    )
}
