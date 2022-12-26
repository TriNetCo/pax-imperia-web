import React, { useEffect } from "react";

import SpaceView from "../features/space_view/SpaceView"

const SystemPage = () => {
    return (
        <div className="page-wrap">

            <div id="app-parent">
                <div id="console-div" className="flex-container">
                    <div className="console-message" id="console-message">
                        Game Paused
                    </div>

                    <div className="console-message" id="time">
                        403.1
                    </div>
                </div>

                <div className="flex-container">

                    <div className="flex-container-left">
                        <div id="planet-list">
                            <h3>Planets:</h3>
                            <ul>
                                <li>Earth</li>
                                <li>Earth2</li>
                            </ul>
                        </div>
                        <div>
                            <button id="btnGovernor">Governor</button>
                        </div>

                    </div>

                    <div id="canvas-and-buttons">
                        <SpaceView />

                        <div id="galaxy-and-console" className="flex-container">
                            <div id="galaxy">
                                Galaxy
                            </div>

                            <div id="lower-console">
                                <div>
                                    Lower Console
                                </div>
                                <input readOnly={true} type="range" min="15" max="300" value="50" className="slider" id="distance-slider"/>
                                <input readOnly={true} type="range" min="-6" max="6" value="-1.5" step="0.05" className="slider" id="x-slider"/>
                                <input readOnly={true} type="range" min="-6" max="6" value="2.6" className="slider" step="0.05" id="y-slider"/>
                                <input readOnly={true} type="range" min="-12" max="12" value="6" className="slider" step="0.05" id="z-slider"/>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SystemPage;
