import ChatLobby from '../ChatPage/ChatLobby';
import {useEffect, useContext} from 'react';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useSelector, useDispatch} from 'react-redux';
import {act, selectWebsocket} from '../../modules/websocket';
import { useParams } from 'react-router-dom';

const JoinLobbyTab = () => {
    const dispatch = useDispatch();
    let { lobbyId } = useParams();
    const websocket = useSelector(selectWebsocket);
    const { data } = useContext(GameDataContext);
    const chatLobbyId = lobbyId;

    useEffect( () => {
        data.gameCustomizations.lobbyType = 'multiplayer';
    }, []);

    // Whenever our websocket.status changes to WS_CONNECTED
    // imediately joinLobby
    useEffect( () => {
        if (websocket.status !== 'WS_CONNECTED') return;

        // If we already have a lobby, just reconnect to it if our connection was interupted
        // Don't rebuild the actual lobby (unless it vanished?)
        joinLobby(chatLobbyId);
    }, [websocket.status]);

    // Download the game data once we've joined the lobby
    useEffect( () => {
        if (!websocket.chatLobbyId) return;
        dispatch(act('GET_GAME_CONFIGURATION')(websocket.chatLobbyId));
    }, [websocket.chatLobbyId]);

    const joinLobby = (chatLobbyId) => {
        data.lobby.joinLobby(chatLobbyId);
    };

    return (
        <>
            <ChatLobby />
        </>
    );
};

export default JoinLobbyTab;
