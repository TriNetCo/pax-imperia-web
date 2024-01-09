import ChatLobby from '../ChatPage/ChatLobby';
import {useEffect, useContext} from 'react';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useSelector, useDispatch} from 'react-redux';
import {getGameConfiguration, selectWebsocket} from '../../modules/websocket';
import { useParams } from 'react-router-dom';

const JoinLobbyTab = () => {
    const dispatch = useDispatch();
    let { lobbyId } = useParams();
    const websocket = useSelector(selectWebsocket);
    const { data } = useContext(GameDataContext);
    const chatLobbyId = lobbyId;

    // Whenever our websocket.status changes to WS_CONNECTED
    // imediately createOrJoinLobby
    useEffect( () => {
        if (websocket.status !== 'WS_CONNECTED') return;

        // If we already have a lobby, just reconnect to it if our connection was interupted
        // Don't rebuild the actual lobby (unless it vanished?)
        createOrJoinLobby(chatLobbyId);
    }, [websocket.status]);

    // Download the game data once we've joined the lobby
    useEffect( () => {
        if (!websocket.chatLobbyId) return;
        dispatch(getGameConfiguration(websocket.chatLobbyId));
    }, [websocket.chatLobbyId]);

    const createOrJoinLobby = (chatLobbyId) => {
        data.lobby.createOrJoinLobby(chatLobbyId);
    };

    return (
        <>
            <ChatLobby />
        </>
    );
};

export default JoinLobbyTab;
