import React, { useEffect } from "react";


const SystemPage = () => {

    useEffect(() => {

        const scripts = ["/script/systems.js"];
        const styles  = ["/css/systems.css"];

        let importMap = attachImportMap();
        let scriptz = attachScript(scripts[0]);
        let stylez = attachStyle(styles[0]);

    //   return () => {
    //       document.body.removeChild(stylez[0]);
    //       document.body.removeChild(scriptz[0]);
    //     }
      }, []);


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



function attachScript(scriptPath) {
    const script = document.createElement('script');
    script.type = "module";
    script.src = scriptPath;
    script.async = false;
    document.body.appendChild(script);
}

function attachStyle(stylePath) {
    const link = document.createElement('link');
    link.href = stylePath;
    link.rel= "stylesheet";
    document.body.appendChild(link);
}

function attachImportMap() {
    const script = document.createElement('script');
    script.type = "importmap";
    script.innerHTML = `
    {
        "imports": {
          "three": "https://unpkg.com/three@0.147.0/build/three.module.js"
        }
    }
    `;
    document.body.appendChild(script);
}

{/* <script type="importmap">
            {
              "imports": {
                "three": "https://unpkg.com/three@0.147.0/build/three.module.js"
              }
            }
          </script> */}

export default SystemPage;