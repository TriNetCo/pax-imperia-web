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

    //////////////////////////////////////
    // Outbound Messages with Responses //
    //////////////////////////////////////

    'AUTHENTICATE': {

        // 1. The action is called to initiate the messaging cycle
        action: (email, displayName, token) =>
            ({ type: 'AUTHENTICATE', email, displayName, token }),

        // 2. Once the action is disptached, this middlwareSend function is invoked by middleware
        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                command: action.type,
                payload: {
                    email: action.email,
                    displayName: action.displayName,
                    token: action.token }
            }));
        },

        // 3. The middleware will fire this function when an AUTHENTICATE_RESPONSE message
        // comes in which will then dispatch the responseAction leading to the reducer
        // dealing with the rest
        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.command)(message.payload.status));
        },

        // 4. Responses AUTHENTICATE are defined here, but will come in as
        // type AUTHENTICATE_RESPONSE
        responseAction: (status) => ({ type: 'AUTHENTICATE_RESPONSE', status }),

    },

    'JOIN_CHAT_LOBBY': {
        action: (user, chatLobbyId) => ({ type: 'JOIN_CHAT_LOBBY', user, chatLobbyId }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                command: action.type,
                payload: { user: action.user, chatLobbyId: action.chatLobbyId }
            }));
        },

        responseAction: (chatLobbyId, chatLobbyUsers) => ({ type: 'JOIN_CHAT_LOBBY_RESPONSE', chatLobbyId, chatLobbyUsers }),

        middlewareRecieve: (store, message) => {
            if (message.payload.status === 'success') {
                store.dispatch(responseAct(message.command)(message.payload.chatLobbyId, message.payload.chatLobbyUsers));
            }
        },

    },

    'GET_GAME_CONFIGURATION': {
        action: (chatLobbyId) => ({ type: 'GET_GAME_CONFIGURATION', chatLobbyId }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                command: action.type,
                payload: { chatLobbyId: action.chatLobbyId }
            }));
        },

        responseAction: (payload) => ({ type: 'GET_GAME_CONFIGURATION_RESPONSE', payload }),

        middlewareRecieve: (store, message) => {
            console.log('not really implemented');
            store.dispatch(responseAct(message.command)(message.payload));
        },

    },

    'SET_GAME_CONFIGURATION': {
        action: (chatLobbyId, systemsJson) =>
            ({ type: 'SET_GAME_CONFIGURATION', payload: { chatLobbyId, systemsJson } }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                command: action.type,
                payload: action.payload
            }));
        },

        responseAction: (payload) => ({ type: 'SET_GAME_CONFIGURATION_RESPONSE', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.command)(message.payload));
        },

    },


    ///////////////////////////////
    // Dangled Outbound Messages //
    ///////////////////////////////

    'NEW_MESSAGE': {
        action: (payload) => ({ type: 'NEW_MESSAGE', payload }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                command: action.type,
                payload: action.payload,
            }));
        },

    },

    'LEAVE_CHAT_LOBBY': {
        action: () => ({ type: 'LEAVE_CHAT_LOBBY' }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                command: action.type
            }));
        },
    },


    ///////////////////////////
    // Inbound Only Messages //
    ///////////////////////////

    'SYSTEM_MESSAGE_NEW_MESSAGE': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_NEW_MESSAGE', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.command)(message.payload));
        },
    },

    'SYSTEM_MESSAGE_USER_JOINED_CHAT': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_USER_JOINED_CHAT', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.command)(message.payload));
        },
    },

    'SYSTEM_MESSAGE_USER_LEFT_CHAT': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_USER_LEFT_CHAT', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.command)(message.payload));
        },
    },

    'SYSTEM_MESSAGE_CHAT_USER_LIST': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_CHAT_USER_LIST', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.command)(message.payload));
        },
    },

};

// allows `dispatch(act('AUTHENTICATE')(email, displayName, token))` syntax
export const act = (key) => {
    return actionTable[key].action;
};

export const responseAct = (key) => {
    return actionTable[key.replace(/_RESPONSE$/, '')].responseAction;
};


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
    seedOnServer: '',
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
        case 'SYSTEM_MESSAGE_NEW_MESSAGE':
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
        case 'SET_GAME_CONFIGURATION_RESPONSE':
            return { ...state, seedOnServer: action.seed };
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
