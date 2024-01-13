import {IconButton} from '@mui/material';
import Modal from 'src/features/Modal/Modal';
import {useHistory} from 'react-router-dom';
import React, { useContext } from 'react';
import { GameDataContext } from 'src/app/GameDataContextProvider';
import {ModalContext} from 'src/app/ModalContextProvider';


const NavConsole = () => {
    const history = useHistory();
    const { modal } = useContext(ModalContext);

    const handleCloseSystemView = () => {
        history.push('/systems');
    };

    const showChat = () => {
        modal.show('CHAT_LOBBY');
    };

    const showLog = () => {
        modal.msgBox({
            title: 'Log',
            body: 'The system is down.',
        });
    };


    return (
        <div id="nav-console" className="flex-container">
            <div className="console-message" id="console-message">
                <button className="green-button">[Research]</button>
                <button className="green-button">[Domestic Policy]</button>
                <button className="green-button">[Trade Routes]</button>
                <button className="green-button">[Foriegn Policy]</button>
                <button className="green-button">[Espionage]</button>
                <button className="green-button">[Military]</button>
                <span>|</span>
                <button className="green-button" onClick={showChat}>[Chat]</button>
                <button className="green-button" onClick={showLog}>[Log]</button>
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
