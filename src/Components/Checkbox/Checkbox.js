
import React, { useState, useEffect} from 'react';
import './Checkbox.scss';


export default function Checkbox({label, checked,onChanged }) {
    const [state, setstate] = useState(checked?checked:false);
    useEffect(() => {
        setstate(checked);
    }, [checked])
    
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
