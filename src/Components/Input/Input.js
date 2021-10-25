
import React, { useState, } from 'react';
import './Input.scss';

export default function Input({label, value, type, placeholder, min, onChange}) {
    const [state, setstate] = useState(value)

    return(
        <div className='inputBody'>
            <div className='inputLabel'>{label}</div>
            <input className='inputContent' 
                type={type}
                value={state} 
                placeholder={placeholder}
                min={min}
                onChange={e=>{
                    e.preventDefault();
                    onChange(e.target.value);
                    setstate(e.target.value)}} />
        </div>
    )
}
