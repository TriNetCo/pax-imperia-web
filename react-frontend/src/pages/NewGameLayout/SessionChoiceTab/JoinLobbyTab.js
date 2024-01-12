import ChatLobby from '../../../features/ChatLobby/ChatLobby';
import {useEffect, useContext} from 'react';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useSelector, useDispatch} from 'react-redux';
import {act, selectWebsocket} from '../../../modules/websocket';
import { useParams, useHistory } from 'react-router-dom';
import Modal from 'src/features/Modal/Modal';

const JoinLobbyTab = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    let { lobbyId } = useParams();
    const websocket = useSelector(selectWebsocket);
    const { data } = useContext(GameDataContext);
    const chatLobbyId = lobbyId;

    useEffect( () => {
        data.initNewGame();
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
        if (websocket.chatLobbyId === '') return;
        if (websocket.chatLobbyId === 'lobby_not_found') {
            // show error using modal
            document.getElementById('modal').style.display = 'block';
            window.modalShown = true;
            data.modal.msgBox({
                title: 'Error', body: 'Lobby does not exist.',
                cb: () => {
                    history.push('/lobbies');
                }});
            return;
        }
        dispatch(act('GET_GAME_CONFIGURATION')(websocket.chatLobbyId));
    }, [websocket.chatLobbyId]);

    const joinLobby = (chatLobbyId) => {
        data.lobby.joinLobby(chatLobbyId);
    };

    return (
        <>
            <Modal />

            <ChatLobby />
        </>
    );
};

export default JoinLobbyTab;
