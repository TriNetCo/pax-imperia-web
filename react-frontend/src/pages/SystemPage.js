import React, { useEffect, useState } from 'react';

import SpaceView from '../features/space_view/SpaceView';
import { Button, IconButton } from '@mui/material';
import {useHistory} from 'react-router-dom';

const SystemPage = () => {
  const history = useHistory();


  const distanceSliderOnInput = () => {
    var input = document.getElementById('distance-slider');
    var currentVal = input.value;
    this.setState({
      value: currentVal
    });
  };

  const xSliderOnInput = () => {
    var input = document.getElementById('x-slider');
    var currentVal = input.value;
    this.setState({
      value: currentVal
    });
  };

  const ySliderOnInput = () => {
    var input = document.getElementById('y-slider');
    var currentVal = input.value;
    this.setState({
      value: currentVal
    });
  };

  const zSliderOnInput = () => {
    var input = document.getElementById('z-slider');
    var currentVal = input.value;
    this.setState({
      value: currentVal
    });
  };

  const handleCloseSystemView = () => {
    history.push('/systems');
  };

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
          <div className='close-system-view'>
            <IconButton onClick={handleCloseSystemView} color="secondary">
              <Button />
            </IconButton>
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
                <p>Distance <input id="distance-slider" type="range" min="15" max="300" step="1" defaultValue="50" onInput={distanceSliderOnInput}/></p>
                <p>X <input id="x-slider" type="range" min="-6" max="6" step="0.05" defaultValue="-1.5" onInput={xSliderOnInput}/></p>
                <p>Y <input id="y-slider" type="range" min="-6" max="6" step="0.05" defaultValue="2.6" onInput={ySliderOnInput}/></p>
                <p>Z <input id="z-slider" type="range" min="-12" max="12" step="0.05" defaultValue="6" onInput={zSliderOnInput}/></p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SystemPage;
