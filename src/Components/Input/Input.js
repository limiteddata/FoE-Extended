
import React, { useState, useEffect} from 'react';
import './Input.scss';

export default function Input({label, value, type, style, placeholder, min, onChange}) {
    const [state, setstate] = useState(value)
    useEffect(() => {
        setstate(value)
    }, [value])
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
                    e.preventDefault();
                    onChange(e.target.value);
                    setstate(e.target.value)}} />
        </div>
    )
}
