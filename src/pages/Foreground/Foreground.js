import React from 'react';
import { render } from 'react-dom';
import { FoEProxy } from '../../FoeHelper/FoeProxy'; 
import { FoEPlayers } from '../../FoeHelper/FoEPlayers/FoEPlayers';
import FoeMainMenu from '../../Components/FoeMainMenu/FoeMainMenu';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ToastStyle.scss';

function Foreground() {  
    return (  
        <>
            <FoeMainMenu/>
            <ToastContainer
                limit={7}
                theme="dark"
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}/>
        </>        
    )
}

export default Foreground;


render(<Foreground />, document.querySelector('#foreground'));