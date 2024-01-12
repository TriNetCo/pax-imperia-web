import {Switch, Route} from 'react-router-dom';
import NewGameBreadCrumb from './NewGameBreadCrumb';
import ColonizerConfigPage from './ColonizerConfigTab/ColonizerConfigTab';
import SpeciesDesignTab from './SpeciesDesignTab/SpeciesDesignTab';
import GalaxyConfigPage from './GalaxyConfigTab/GalaxyConfigTab';
import GameDashboardPage from '../game/DashboardPage/DashboardPage';
import UserCard from 'src/shared/UserCard/UserCard';
import SessionChoiceTab from './SessionChoiceTab/SessionChoiceTab';
import HostLobbyTab from './SessionChoiceTab/HostLobbyTab';
import JoinLobbyTab from './SessionChoiceTab/JoinLobbyTab';
import './NewGameLayout.css';

const NewGameLayout = () => {
    return (
        <>
            <UserCard />
            <div className="newgame-wrap">
                <div className="big-header">New Game</div>

                <NewGameBreadCrumb />
                <Switch>
                    <Route exact path="/new_game" component={SessionChoiceTab} />

                    <Route path="/new_game/colonizer_config" component={ColonizerConfigPage} />
                    <Route path="/new_game/species_design" component={SpeciesDesignTab} />
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
