import React from 'react';
import { render } from 'react-dom';
import FoeMainMenu from '../../Components/FoeMainMenu/FoeMainMenu';

function Foreground() {   
    return (          
        <FoeMainMenu/>
    )
}

export default Foreground;


render(<Foreground />, document.querySelector('#foreground'));