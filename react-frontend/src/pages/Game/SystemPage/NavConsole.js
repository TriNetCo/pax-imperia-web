import {IconButton} from '@mui/material';
import Modal from 'src/shared/Modal/Modal';
import {useHistory} from 'react-router-dom';
import React from 'react';


const NavConsole = () => {
    const history = useHistory();

    const handleCloseSystemView = () => {
        history.push('/systems');
    };

    const showChat = () => {
        document.getElementById('modal').style.display = 'block';
        window.modalShown = true;
    };


    return (
        <div id="nav-console" className="flex-container">
            <Modal />
            <div className="console-message" id="console-message">
                <button className="green-button">[Research]</button>
                <button className="green-button">[Domestic Policy]</button>
                <button className="green-button">[Trade Routes]</button>
                <button className="green-button">[Foriegn Policy]</button>
                <button className="green-button">[Espionage]</button>
                <button className="green-button">[Military]</button>
                <span>|</span>
                <button className="green-button" onClick={showChat}>[Chat]</button>
                <button className="green-button">[Log]</button>
            </div>

            <div className="console-message" id="time"></div>
            <div className='close-system-view'>
                <IconButton onClick={handleCloseSystemView} color="secondary" style={{width: '100%', height: '100%'}}>
                    <span style={{width: '20px', height: '20px'}}></span>
                </IconButton>
            </div>
        </div>
    );
};

export default NavConsole;
