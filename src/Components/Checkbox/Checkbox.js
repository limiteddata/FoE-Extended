
import React, { useState, } from 'react';
import './Checkbox.scss';

export default function Checkbox({label, checked,onChanged, noState }) {
    const [state, setstate] = useState(checked?checked:false);
    if(state !== checked) setstate(checked);
    return(
        <div className='checkboxBody' onClick={()=>{
            onChanged && onChanged(!state);
            setstate(oldstate=> !oldstate)
            }}>
            <div className='checkboxLabel'>{label}</div>
            { 
                state && <div className='checkboxCheck'></div> 
            }
        </div>
    )
}
