import React from 'react';
import { Link } from 'react-router-dom';

import Galaxy from 'src/features/Galaxy/Galaxy';
import UserCard from 'src/shared/UserCard/UserCard';

const GameDashboardPage = () => {

    return (
        <div className="page-wrap">
            <div id="app-parent" className="systems-screen">
                <div className="wrap-block"></div>
                <UserCard />

                <div className="galaxy-flexer">
                    <div>
                        <h1>Galactic View</h1>
                        <Galaxy />
                    </div>

                </div>

                <div className="links" style={{ display: 'flex'}}>
                    <div className="management-views">
                        <div className="header">Management</div>
                        <ul>
                            <li>The links are disabled,</li>
                            <li>please click the stars in </li>
                            <li>the starchart instead :)</li>
                            {/* <li><a href="fleet.html">Fleet</a></li> */}
                            <li><a href="research.html">Research</a></li>
                            {/* <li><a href="swords.html">Foriegn Policy</a></li> */}
                            <li><a href="domestic.html">Domestic Policy</a></li>
                        </ul>
                    </div>

                    <div className="misc-views">
                        <div className="header">Misc Views</div>
                        <ul>
                            <li><Link to="/chat">Chat</Link></li>
                            <li><Link to="/config">Config</Link></li>
                            <li><a href="ship.html">Ship Design</a></li>
                            {/* <li><a href="surface.html">Surface View</a></li> */}
                            {/* <li><a href="new_game.html">New Game Parameters</a></li> */}
                            <li><a href="species.html">Species Design</a></li>
                            <li><a href="/">Back</a></li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GameDashboardPage;
