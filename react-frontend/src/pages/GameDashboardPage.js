import React from 'react';
import { Link } from 'react-router-dom';

import Galaxy from '../features/galaxy/Galaxy';
import { useDispatch } from 'react-redux';
import { newMessage } from '../modules/websocket';
import UserCard from 'src/shared/UserCard/UserCard';

const GameDashboardPage = () => {
  const dispatch = useDispatch();

  const doSomething = () => {
    const msg = 'hihihi';
    alert('Sending: ' + msg);
    dispatch(newMessage(msg));
  };

  return (
    <div className="page-wrap">
      <div id="app-parent">
        <div className="wrap-block"></div>
        <UserCard />

        <h1>Galactic View</h1>
        <div id="lower-console"></div>
        <center>
        <Galaxy/>
        </center>
        <div>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;System: <span id="system-name"></span></div>

        <div className="links" style={{ display: 'flex' }}>
          <div className="management-views">
            <h5>Management</h5>
            <ul>
              <li><a href="fleet.html">Fleet</a></li>
              <li><a href="research.html">Research</a></li>
              <li><a href="swords.html">Foriegn Policy</a></li>
              <li><a href="domestic.html">Domestic Policy</a></li>
            </ul>
          </div>

          <div className="misc-views">
            <h5>Misc Views</h5>
            <ul>
              <li><a href="config.html">Config</a></li>
              <li><a href="ship.html">Ship Design</a></li>
              <li><a href="surface.html">Surface View</a></li>
              <li><a href="new_game.html">New Game Parameters</a></li>
              <li><a href="species.html">Species Design</a></li>
            </ul>
          </div>

          <div className="dev-space">
            <h5>Dev Space</h5>
            <ul>
              <li><Link to="/systems/1"> System 1 </Link></li>
              <li><button onClick={doSomething}>Do Something</button></li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameDashboardPage;
