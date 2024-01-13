import ChatLobby from '../../../features/ChatLobby/ChatLobby';
import {useEffect, useContext} from 'react';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useSelector, useDispatch} from 'react-redux';
import {selectWebsocket, act} from '../../../modules/websocket';

const HostLobbyTab = () => {
    const dispatch = useDispatch();
    const websocket = useSelector(selectWebsocket);
    const { data } = useContext(GameDataContext);

    useEffect( () => {
        data.initNewGame();
        data.gameCustomizations.isLobbyKing = true;
        data.gameCustomizations.lobbyType = 'multiplayer';
    }, []);

    // Whenever our websocket.status changes to WS_CONNECTED (or we load this page)
    // imediately create the lobby
    useEffect( () => {
        if (websocket.status !== 'WS_CONNECTED' ||
            websocket.chatLobbyId) return;

        dispatch(act('CREATE_CHAT_LOBBY')(data.gameCustomizations.isPrivate));
    }, [websocket.status]);

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
