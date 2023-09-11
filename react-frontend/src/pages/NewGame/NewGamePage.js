import {Link, Switch, Route} from 'react-router-dom';
import NewGameBreadCrumb from './NewGameBreadCrumb';
import { GameDataContext } from 'src/app/Context';
import {useContext, useEffect} from 'react';
import ColonizerConfigPage from './ColonizerConfigPage';
import SpeciesDesignPage from './SpeciesDesignPage';
import GalaxyConfigPage from './GalaxyConfigPage';
import ChatLobby from '../ChatPage/ChatLobby';
import GameDashboardPage from '../GameDashboardPage';
import {authenticate, joinChatLobby} from '../../modules/websocket';
import './NewGamePage.css';
import { useDispatch } from 'react-redux';
import UserContext from 'src/app/UserContext';
import UserCard from 'src/shared/UserCard/UserCard';

const NewGameLayout = () => {

  const dispatch = useDispatch();
  const userContext = useContext(UserContext);
  const data = useContext(GameDataContext);

  //   useEffect(() => {
  //     createNewMultiplayerGame();
  //   }, []);


  const createNewMultiplayerGame = () => {
    // TODO: This is a hack to get the lobby token to show up in the URL
    // We should probably use a different method
    // setTimeout(() => {
    //   window.location.href = `/new_game/lobby/${data.lobbyToken}`;
    // }, 1000);

    createNewLobby();
  };

  const createNewLobby = () =>  {
    const lobbyId = '1234';
    dispatch(authenticate(userContext.email, userContext.displayName, userContext.token));
    dispatch(joinChatLobby(userContext.email, lobbyId));
  };

  return (
    <>
      <UserCard />
      <div className="newgame-wrap">
        <div className="big-header">New Multiplayer Game</div>
        <button onClick={createNewLobby}>Create or Join New Lobby</button>
        <NewGameBreadCrumb />
        <Switch>
          <Route exact path="/new_game" component={ChatLobby} />

          <Route path="/new_game/colonizer_config" component={ColonizerConfigPage} />
          <Route path="/new_game/species_design" component={SpeciesDesignPage} />
          <Route path="/new_game/galaxy_config" component={GalaxyConfigPage} />
          <Route path="/new_game/lobby/:lobbyToken" component={ChatLobby} />
          <Route path="/new_game/lobby/:lobbyToken/game" component={GameDashboardPage} />
        </Switch>
      </div>
    </>
  );
};

export default NewGameLayout;
