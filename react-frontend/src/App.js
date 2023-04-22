import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';
import GameDashboardPage from './pages/GameDashboardPage';
import DebugPage from './pages/DebugPage/DebugPage';
import SystemPage from './pages/SystemPage';
import LoginPage from './pages/LoginPage/LoginPage';
import UsersPage from './features/users/UsersPage';
import LandingPage from './pages/LandingPage/LandingPage';
import ColonizerConfigPage from './pages/NewGame/ColonizerConfigPage';
import GalaxyConfigPage from './pages/NewGame/GalaxyConfigPage';
import MultiplayerLobbyPage from './pages/NewGame/MultiplayerLobbyPage';
import NewGamePage from './pages/NewGame/NewGamePage';
import SpeciesDesignPage from './pages/NewGame/SpeciesDesignPage';
import AboutPage from './pages/AboutPage';
import usePageTracking from './app/usePageTracking';

function App() {
  usePageTracking();

  return (
    <div className="App">
      <Switch>
        <Route exact path="/"      component={LandingPage} />
        <Route exact path="/game"  component={GameDashboardPage} />
        <Route exact path="/game/dashboard" component={GameDashboardPage} />
        <Route exact path="/systems" component={GameDashboardPage} />
        <Route exact path="/systems/:systemId" component={SystemPage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/debug" component={DebugPage} />
        <Route exact path="/users" component={UsersPage} />
        <Route exact path="/about" component={AboutPage} />

        {/* End State for Menu and stuff */}
        <Route exact path="/"                          component={LandingPage}      />        {/* Shows the Sign-in stuff or the user's dashboard including 'newgame' button */}

        <Route exact path="/new_game"                  component={NewGamePage} />             {/* Maybe this is a breadcrumb interface? */ }
        <Route exact path="/new_game/colonizer_config" component={ColonizerConfigPage} />     {/* Choose your species here, or click to design one */}
        <Route exact path="/new_game/species_design"   component={SpeciesDesignPage} />
        <Route exact path="/new_game/galaxy_config"    component={GalaxyConfigPage} />        {/* Define the galaxy parameters and generate a galaxy here */}

        <Route exact path="/new_game/lobby/:lobbyToken"  component={MultiplayerLobbyPage}  /> {/* A lobby is a link to a chat room with galaxy data that the owner can define */}

        {/* End State for Game Pages: */}
        <Route exact path="/game/:gameId" component={GameDashboardPage} />
        <Route exact path="/game/:gameId/systems/:systemId" component={SystemPage} />

      </Switch>
    </div>
  );
}

export default App;
