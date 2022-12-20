import React, { useEffect } from "react";

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
                        <div id="canvas-div"></div>

                        <div id="galaxy-and-console" className="flex-container">
                            <div id="galaxy">
                                Galaxy
                            </div>

                            <div id="lower-console">
                                <div>
                                    Lower Console
                                </div>
                                {/* <input type="range" min="0" max="300" value="0" className="slider" id="slider" /> */}
                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SystemPage;
