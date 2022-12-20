import React from "react";

import Galaxy from '../features/galaxy/Galaxy';

const HomePage = () => {

    return (
        <div className="App">
            <h1>Galactic View</h1>
            <div>System: <span id="system-name"></span></div>

            <Galaxy/>

            <div className="links">
                <h6>Management</h6>
                <ul>
                    <li><a href="fleet.html">Fleet</a></li>
                    <li><a href="research.html">Research</a></li>
                    <li><a href="swords.html">Foriegn Policy</a></li>
                    <li><a href="domestic.html">Domestic Policy</a></li>
                </ul>

                <h6>Misc Views</h6>
                <ul>
                    <li><a href="config.html">Config</a></li>
                    <li><a href="ship.html">Ship Design</a></li>
                    <li><a href="surface.html">Surface View</a></li>
                    <li><a href="new_game.html">New Game Parameters</a></li>
                    <li><a href="species.html">Species Design</a></li>
                </ul>
            </div>

        </div>
    );
};

export default HomePage;