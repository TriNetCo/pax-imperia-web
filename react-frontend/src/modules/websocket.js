import * as actions from './websocket';

/*
* Summary of How Convoluted Redux Websocket Middleware Works:
*
* onMessage will run whenever this client receives a message from the server
* then it will dispatch an action to the store, which will be handled by the reducer
* the reducer will then update the state of the store
* the store will then update the state of the component
* for the component to re-render, it must be connected to the store
* this is done by doing a `websocket = useSelector(selectWebsocket)` in the component
* websocket.messages will be an array of all messages that the react client has received
* see react-frontend/src/pages/ChatPage/ChatLobby.js for an example
*/


///////////////////
// Local Actions //
///////////////////

export const wsConnect = host => ({ type: 'WS_CONNECT', host });
export const wsDisconnect = host => ({ type: 'WS_DISCONNECT', host });
export const wsConnected = host => ({ type: 'WS_CONNECTED', host });
export const wsDisconnected = host => ({ type: 'WS_DISCONNECTED', host });
export const wsError = host => ({ type: 'WS_ERROR', host });


////////////////
// BETTER WAY //
////////////////

// short for action to make dispatch calls less hideous and avoid name collisions
export const actionTable = {
    'AUTHENTICATE': { // also AUTHENTICATE_RESPONSE
        action: (email, displayName, token) =>
            ({ type: 'AUTHENTICATE', email, displayName, token }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                command: 'AUTHENTICATE',
                payload: {
                    email: action.email,
                    displayName: action.displayName,
                    token: action.token }
            }));
        },

        responseAction: (status) => ({ type: 'AUTHENTICATE_RESPONSE', status }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct('AUTHENTICATE')(message.payload.status));
        },

    }
};

// allows `dispatch(act('AUTHENTICATE')(email, displayName, token))` syntax
export const act = (key) => {
    return actionTable[key].action;
};

export const responseAct = (key) => {
    return actionTable[key].responseAction;
};


/////////////////////////////////////
// Outbound Messages and Responses //
/////////////////////////////////////

// export const authenticate = (email, displayName, token) => ({ type: 'AUTHENTICATE', email, displayName, token });
// export const authenticateResponse = (status) => ({ type: 'AUTHENTICATE_RESPONSE', status });
export const newMessage = payload => ({ type: 'NEW_MESSAGE', payload });
export const joinChatLobby = (user, chatLobbyId) => ({ type: 'JOIN_CHAT_LOBBY', user, chatLobbyId });
export const joinChatLobbyResponse = (chatLobbyId, chatLobbyUsers) => ({ type: 'JOIN_CHAT_LOBBY_RESPONSE', chatLobbyId, chatLobbyUsers });
export const leaveChatLobby = () => ({ type: 'LEAVE_CHAT_LOBBY' });
export const setGameConfiguration = (chatLobbyId, systemsJson) => ({ type: 'SET_GAME_CONFIGURATION', payload: { chatLobbyId, systemsJson } });
export const getGameConfiguration = (chatLobbyId) => ({ type: 'GET_GAME_CONFIGURATION', chatLobbyId });
export const getGameConfigurationResponse = (payload) => ({ type: 'GET_GAME_CONFIGURATION_RESPONSE', payload });

// export const updateGame = (json, player) => ({ type: 'SET_GAME', data: json, player });

///////////////////////////
// Inbound Only Messages //
///////////////////////////

export const newMessageFromServer = payload => ({ type: 'NEW_MESSAGE_FROM_SERVER', payload });
export const systemMessageUserJoinedChat = (payload) => ({ type: 'SYSTEM_MESSAGE_USER_JOINED_CHAT', payload });
export const systemMessageUserLeftChat = (payload) => ({ type: 'SYSTEM_MESSAGE_USER_LEFT_CHAT', payload });
export const systemMessageChatUserList = (payload) => ({ type: 'SYSTEM_MESSAGE_CHAT_USER_LIST', payload });

///////////////////////////////////////
// Non-Networked store manipulations //
///////////////////////////////////////

export const setChatLobbyId = (chatLobbyId) => ({ type: 'SET_CHAT_LOBBY_ID', chatLobbyId });

const initialState = {
    time: null,
    status: null,
    host: null,
    messages: [],
    chatLobbyId: '',
    chatLobbyUsers: [],
    authenticationStatus: 'UNAUTHENTICATED',
    systemsJson: null,
};

/////////////
// REDUCER //
/////////////

export const websocketReducer = (state = { ...initialState }, action) => {
    switch (action.type) {
        case 'WS_CONNECTED':
            return { ...state, host: action.host, status: 'WS_CONNECTED' };
        case 'WS_DISCONNECTED':
            return { ...state, status: 'WS_DISCONNECTED' };
        case 'SET_GAME':
            return { ...state, game: action.data, current_player: action.player };
        case 'NEW_MESSAGE_FROM_SERVER':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'JOIN_CHAT_LOBBY_RESPONSE':
            return { ...state, chatLobbyId: action.chatLobbyId, chatLobbyUsers: action.chatLobbyUsers };
        case 'SYSTEM_MESSAGE_USER_JOINED_CHAT':
            return { ...state, chatLobbyUsers: [...state.chatLobbyUsers, action.payload.displayName ] };
        case 'SYSTEM_MESSAGE_USER_LEFT_CHAT':
            const chatLobbyUsers = state.chatLobbyUsers.filter(user => user !== action.payload.displayName);
            return { ...state, chatLobbyUsers: [...chatLobbyUsers ] };
        case 'SYSTEM_MESSAGE_CHAT_USER_LIST':
            return { ...state, chatLobbyUsers: action.payload };
        case 'AUTHENTICATE_RESPONSE':
            return { ...state, authenticationStatus: action.status };
        case 'GET_GAME_CONFIGURATION_RESPONSE':
            return { ...state,
                systemsJson: action.payload.systemsJson,
                time: action.payload.time };
        case 'SET_CHAT_LOBBY_ID':
            return { ...state,
                chatLobbyId: action.chatLobbyId
            };
        default:
            console.log('websocketReducer: default action: ' + action.type);
            return state;
    }
};

export const selectWebsocket = (state) => state.websocket;
