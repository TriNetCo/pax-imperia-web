import {Link, Switch, Route} from 'react-router-dom';
import NewGameBreadCrumb from './NewGameBreadCrumb';
import ColonizerConfigPage from './ColonizerConfigPage';
import SpeciesDesignPage from './SpeciesDesignPage';
import GalaxyConfigPage from './GalaxyConfigPage';
import GameDashboardPage from '../GameDashboardPage';
import './NewGamePage.css';
import UserCard from 'src/shared/UserCard/UserCard';
import SingleOrMultiplayerPage from './SingleOrMultiplayerPage';
import HostLobbyTab from './HostLobbyTab';
import JoinLobbyTab from './JoinLobbyTab';

const NewGameLayout = () => {
    return (
        <>
            <UserCard />
            <div className="newgame-wrap">
                <div className="big-header">New Game</div>

                <NewGameBreadCrumb />
                <Switch>
                    <Route exact path="/new_game" component={SingleOrMultiplayerPage} />

                    <Route path="/new_game/colonizer_config" component={ColonizerConfigPage} />
                    <Route path="/new_game/species_design" component={SpeciesDesignPage} />
                    <Route path="/new_game/galaxy_config" component={GalaxyConfigPage} />

                    <Route exact path="/new_game/lobbies" component={HostLobbyTab} />

                    <Route path="/new_game/lobbies/:lobbyId" component={JoinLobbyTab} />
                    <Route path="/new_game/lobbies/:lobbyToken/game" component={GameDashboardPage} />
                </Switch>
            </div>
        </>
    );
};

export default NewGameLayout;
