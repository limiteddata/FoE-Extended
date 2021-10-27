import React, { useContext, useEffect, useState }from 'react';
import ModalWindow from '../../ModalWindow/ModalWindow';

import { requestJSON } from '../../../FoeHelper/Utils';
import { FoERequest } from '../../../FoeHelper/FoeRequest';

import { toast } from 'react-toastify';


export default function Window4({open,setOpen}) {
    const notify = () => toast('🦄 Wow so easy!', {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
        });

    return(
        <ModalWindow
            title={'Modal Menu'}
            initialWidth={400}
            initialHeight={350}
            minWidth={120}
            minHeight={80}
            settings={()=>alert('open settings window')}
            openWindow={open}
            closeWindow={()=>setOpen(false)}>
            <button onClick={()=>{
                const getTest = new Promise((res,err)=>{
                    console.log('caca')
                    res();
                }).then();
                toast.promise(
                    getTest,
                    {
                      pending: 'Promise is pending',
                      success: 'Promise resolved 👌',
                      error: 'Promise rejected 🤯'
                    }
                )
            }}>Notify!</button>
            
        </ModalWindow>
    )
}
