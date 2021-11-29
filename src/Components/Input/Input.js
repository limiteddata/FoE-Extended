
import React, { useState, useEffect} from 'react';
import './Input.scss';

export default function Input({label, value, type, style, placeholder, min, max, onChange}) {
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
                max={max}
                onChange={e=>{
                    e.preventDefault();
                    if(type === 'number' && (!e.target.value || e.target.value === '')) e.target.value = 0; 
                    onChange(e.target.value);
                    setstate(e.target.value)}} />
            {
                type === 'range' && 
                <input 
                    className='inputContent'
                    type='number'
                    value={state}
                    min={min}
                    max={max}
                    onChange={e=>{
                        e.preventDefault();
                        if(!e.target.value || e.target.value === '') e.target.value = 0; 
                        onChange(e.target.value);
                        setstate(e.target.value)}}/>
            }
        </div>
    )
}
