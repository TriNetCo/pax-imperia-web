import React, { useEffect, useState } from 'react';

import SpaceView from '../features/space_view/SpaceView';
import { Button, IconButton } from '@mui/material';
import {useHistory} from 'react-router-dom';
import Galaxy from 'src/features/galaxy/Galaxy';

const SystemPage = () => {
    const history = useHistory();

    const handleCloseSystemView = () => {
        history.push('/systems');
    };

    const handleExpandButton = () => {
        var expandableDiv = document.getElementById('lower-console-and-button');
        expandableDiv.classList.toggle('expanded');
        var button = document.getElementById('expand');
        if (button.textContent == 'v') {
            button.textContent = '^';
        } else {
            button.textContent = 'v';
        }
    };


    return (
        <div className="page-wrap">
            <div id="app-parent">
                <div id="console-div" className="flex-container">
                    <div className="console-message" id="console-message">
                        Game Paused
                    </div>

                    <div className="console-message" id="time"></div>
                    <div className='close-system-view'>
                        <IconButton onClick={handleCloseSystemView} color="secondary" style={{width: '100%', height: '100%'}}>
                            <span style={{width: '20px', height: '20px'}}></span>
                        </IconButton>
                    </div>
                </div>

                <div className="flex-container">

                    <div className="flex-container-left">
                        <div className="left-menu-div">
                            <h6 id="stars">&#9660; Solar:</h6>
                            <ul id="star-list" className="sidebar-list"></ul>
                            <h6 id="planets">&#9660; Planets:</h6>
                            <ul id="planet-list" className="sidebar-list"></ul>
                            <h6 id="ships">&#9654; Ships:</h6>
                            <ul id="ship-list" className="sidebar-list"></ul>
                            <h6 id="wormholes">&#9654; Wormholes:</h6>
                            <ul id="wormhole-list" className="sidebar-list"></ul>
                        </div>
                        <div>
                            <button id="btnGovernor">Governor</button>
                        </div>

                    </div>
                    <div id="canvas-and-buttons">
                        <SpaceView />

                        <div id="galaxy-and-console" className="flex-container">
                            <div id="galaxy">
                                <Galaxy canvasWidth={400} canvasHeight={200} />
                            </div>

                            <div id="lower-console-and-button">
                                <div id="expand-button">
                                    <button id="expand" onClick={handleExpandButton}>^</button>
                                </div>
                                <div id="lower-console">
                                </div>
                                <div id="player-buttons"></div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SystemPage;
