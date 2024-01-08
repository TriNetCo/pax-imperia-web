import {Link, Switch, Route} from 'react-router-dom';
import NewGameBreadCrumb from './NewGameBreadCrumb';
import { GameDataContext } from 'src/app/GameDataContextProvider';
import {useContext, useEffect} from 'react';
import ColonizerConfigPage from './ColonizerConfigPage';
import SpeciesDesignPage from './SpeciesDesignPage';
import GalaxyConfigPage from './GalaxyConfigPage';
import ChatLobby from '../ChatPage/ChatLobby';
import GameDashboardPage from '../GameDashboardPage';
import {authenticate, getGameConfiguration, joinChatLobby, setGameConfiguration, selectWebsocket, setChatLobbyId} from '../../modules/websocket';
import './NewGamePage.css';
import {useDispatch, useSelector} from 'react-redux';
import UserContext from 'src/app/UserContext';
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
                    <Route path="/new_game/lobbies" component={HostLobbyTab} />

                    <Route path="/new_game/colonizer_config" component={ColonizerConfigPage} />
                    <Route path="/new_game/species_design" component={SpeciesDesignPage} />
                    <Route path="/new_game/galaxy_config" component={GalaxyConfigPage} />
                    <Route path="/new_game/lobby/:lobbyId" component={JoinLobbyTab} />
                    <Route path="/new_game/lobby/:lobbyToken/game" component={GameDashboardPage} />
                </Switch>
            </div>
        </>
    );
};

export default NewGameLayout;
