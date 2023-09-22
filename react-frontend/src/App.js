import React from 'react';
import './App.css';
import { Route, HashRouter, Switch } from 'react-router-dom';
import GameDashboardPage from './pages/GameDashboardPage';
import DebugPage from './pages/DebugPage/DebugPage';
import SystemPage from './pages/SystemPage';
import LoginPage from './pages/LoginPage/LoginPage';
import ChatPage from './pages/ChatPage/ChatPage';
import UsersPage from './features/users/UsersPage';
import LandingPage from './pages/LandingPage/LandingPage';
import ColonizerConfigPage from './pages/NewGame/ColonizerConfigPage';
import GalaxyConfigPage from './pages/NewGame/GalaxyConfigPage';
import MultiplayerLobbyPage from './pages/NewGame/MultiplayerLobbyPage';
import NewGameLayout from './pages/NewGame/NewGamePage';
import SpeciesDesignPage from './pages/NewGame/SpeciesDesignPage';
import AboutPage from './pages/AboutPage';
import usePageTracking from './app/usePageTracking';

function App() {
    usePageTracking();

    return (
        <div className="App">
            <HashRouter>
                <Route exact path="/game"  component={GameDashboardPage} />
                <Route exact path="/game/dashboard" component={GameDashboardPage} />
                <Route exact path="/systems" component={GameDashboardPage} />
                <Route exact path="/systems/:systemId" component={SystemPage} />
                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/debug" component={DebugPage} />
                <Route exact path="/users" component={UsersPage} />
                <Route exact path="/about" component={AboutPage} />
                <Route exact path="/chat" component={ChatPage} />

                {/* End State for Menu and stuff */}
                <Route exact path="/"                          component={LandingPage}      />        {/* Shows the Sign-in stuff or the user's dashboard including 'newgame' button */}

                <Route path="/new_game" component={NewGameLayout} />

                {/* End State for Game Pages: */}
                <Route exact path="/game/:gameId" component={GameDashboardPage} />
                <Route exact path="/game/:gameId/systems/:systemId" component={SystemPage} />

            </HashRouter>
        </div>
    );
}

export default App;
