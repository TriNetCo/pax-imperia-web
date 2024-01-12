import React from 'react';

import SpaceView from 'src/features/SpaceView/SpaceView';
import Galaxy from 'src/features/Galaxy/Galaxy';
import NavConsole from './NavConsole';

const SystemPage = () => {

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
            <div id="app-parent" className="system-app-parent">

                <div id="ultra-container">

                    <NavConsole />

                    <div id="big-container" className="flex-container">

                        <div id="flex-container-left">
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
                            <div className="left-menu-bottom">
                                <button id="btnGovernor">GOVERNOR</button>
                            </div>
                        </div>

                        <div id="panel-minimize-div"></div>

                        <div id="canvas-and-buttons">
                            <SpaceView canvasFullScreen={true} />

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
                                    <div id="static-console"></div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SystemPage;
