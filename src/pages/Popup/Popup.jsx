import React, {useState} from 'react';
import './Popup.css';

const Popup = () => {

  return (
    <div className="App">
      <header className="App-header">
          <p>Welcome to FOE Extended</p>
          <img className='App-logo' src='../../assets/img/icon-512.png'/>
          <p>For this extension to work you need to login into a Forge of Empires world</p>
          <p>For more information go to: <a className='App-link' href='https://github.com/limiteddata/FoE-Extended'>https://github.com/limiteddata/FoE-Extended</a></p>    
      </header>
    </div>
  );
};

export default Popup;
