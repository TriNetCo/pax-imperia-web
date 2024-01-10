import ChatLobby from '../ChatPage/ChatLobby';
import {useEffect, useContext} from 'react';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useSelector, useDispatch} from 'react-redux';
import {selectWebsocket, act} from '../../modules/websocket';

const HostLobbyTab = () => {
    const dispatch = useDispatch();
    const websocket = useSelector(selectWebsocket);
    const { data } = useContext(GameDataContext);
    const chatLobbyId = '1234';

    useEffect( () => {
        data.galaxyCustomizations.isLobbyKing = true;
        data.galaxyCustomizations.lobbyType = 'multiplayer';
    }, []);

    // Whenever our websocket.status changes to WS_CONNECTED
    // imediately createOrJoinLobby
    useEffect( () => {
        if (websocket.status !== 'WS_CONNECTED') return;

        // If we already have a lobby, just reconnect to it if our connection was interupted
        // Don't rebuild the actual lobby (unless it vanished?)
        createOrJoinLobby(chatLobbyId);
    }, [websocket.status]);

    const createOrJoinLobby = (chatLobbyId) => {
        data.lobby.createOrJoinLobby(chatLobbyId);
    };

    // After we create the lobby, upload our galaxy's data to it
    useEffect( () => {
        if (!websocket.chatLobbyId) return;

        uploadGameData();
    }, [websocket.chatLobbyId]);

    const uploadGameData = () => {
        const systemsJson = data.galaxyWidget.exportGalaxyDataToJson();
        dispatch(act('SET_GAME_CONFIGURATION')(websocket.chatLobbyId, systemsJson));
    };

    return (
        <>
            <ChatLobby />
        </>
    );
};

export default HostLobbyTab;
