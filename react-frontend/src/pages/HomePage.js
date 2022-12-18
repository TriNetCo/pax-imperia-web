import React, { useEffect } from "react";

import Circle from './Circle';

const HomePage = () => {

    useEffect(() => {
        const script = document.createElement('script');
        script.type = "module";
        script.src = "/script/app.js";
        script.async = true;
        document.body.appendChild(script);
      return () => {
          document.body.removeChild(script);
        }
      }, []);


    return (
        <div className="App">
            <h1>Galactic View</h1>
            <div>System: <span id="system-name"></span></div>
            <canvas id="galaxy-canvas-large" width="800" height="400"></canvas>

            <Circle/>


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



            <script type="module" src="script/app.js"></script>
        </div>
    );
};

export default HomePage;