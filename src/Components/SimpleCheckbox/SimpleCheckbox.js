
import React, { useState, useEffect} from 'react';
import './SimpleCheckbox.scss';


export default function SimpleCheckbox({label, checked,onChanged }) {
    const [state, setstate] = useState(checked?checked:false);
    useEffect(() => {
        setstate(checked);
    }, [checked])
    
    return(
        <div className='simplecheckboxBody' onClick={()=>{
            onChanged && onChanged(!state);
            setstate(oldstate=> !oldstate)}}>
            <label>{label}</label>
            <div className='checkboxCheck'>
                { 
                    state && <div className='checkboxChecked'></div> 
                }
            </div>
        </div>
    )
}
