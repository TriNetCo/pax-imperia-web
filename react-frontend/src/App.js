import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';
import GameDashboardPage from './pages/GameDashboardPage';
import DebugPage from './pages/DebugPage/DebugPage';
import SystemPage from './pages/SystemPage';
import LoginPage from './pages/LoginPage/LoginPage';
import ChatPage from './pages/ChatPage/ChatPage';
import UsersPage from './features/users/UsersPage';
import LandingPage from './pages/LandingPage/LandingPage';
import NewGameLayout from './pages/NewGame/NewGamePage';
import AboutPage from './pages/AboutPage';
import usePageTracking from './app/usePageTracking';
import PreferencesPage from './pages/PreferencesPage/PreferencesPage';
import LobbiesPage from './features/lobbies/LobbiesPage';

function App() {
    usePageTracking();

    return (
        <div className="App">
            <Switch>
                <Route exact path="/game"  component={GameDashboardPage} />
                <Route exact path="/game/dashboard" component={GameDashboardPage} />
                <Route exact path="/systems" component={GameDashboardPage} />
                <Route exact path="/systems/:systemId" component={SystemPage} />
                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/debug" component={DebugPage} />
                <Route exact path="/users" component={UsersPage} />
                <Route exact path="/about" component={AboutPage} />
                <Route exact path="/chat" component={ChatPage} />
                <Route exact path="/preferences" component={PreferencesPage} />

                <Route exact path="/lobbies" component={LobbiesPage} />

                {/* End State for Menu and stuff */}
                <Route exact path="/"                          component={LandingPage}      />        {/* Shows the Sign-in stuff or the user's dashboard including 'newgame' button */}

                <Route path="/new_game" component={NewGameLayout} />

                {/* End State for Game Pages: */}
                <Route exact path="/game/:gameId" component={GameDashboardPage} />
                <Route exact path="/game/:gameId/systems/:systemId" component={SystemPage} />


            </Switch>
        </div>
    );
}

export default App;
