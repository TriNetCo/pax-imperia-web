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

// Dispatching this action begins the app opening a websocket connection
export const wsConnect = host => ({ type: 'WS_CONNECT', host });

// When the connection is actually established from wsConnect,
// this action is dispatched so the store knows the connection status
export const wsConnected = host => ({ type: 'WS_CONNECTED', host });

// This isn't used, but would be required for load balancing
export const wsDisconnect = host => ({ type: 'WS_DISCONNECT', host });
export const wsDisconnected = host => ({ type: 'WS_DISCONNECTED', host });

export const setChatLobbyId = (chatLobbyId) => ({ type: 'SET_CHAT_LOBBY_ID', chatLobbyId });


/////////////////
// actionTable //
/////////////////
//
// All websocket message routing and functionality is defined here
// (exluding reducers atm due to time constraints and uncertainty)
//
export const actionTable = {

    //////////////////////////////////////
    // Outbound Messages with Responses //
    //////////////////////////////////////

    'AUTHENTICATE': {

        // 1. The action is called to initiate the messaging cycle
        action: (email, displayName, token) =>
            ({ type: 'AUTHENTICATE', payload: { email, displayName, token } }),

        // 2. Once the action is disptached, this function is invoked by middleware
        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                type: action.type,
                payload: action.payload
            }));
        },

        // 3. The middleware will fire this function when an AUTHENTICATE_RESPONSE message
        // comes in which will then dispatch the responseAction leading to the reducer
        // dealing with the rest
        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.type)(message.payload.authStatus));
        },

        // 4. Responses to AUTHENTICATE are defined here, but will come in as
        // type AUTHENTICATE_RESPONSE
        responseAction: (authStatus) => ({ type: 'AUTHENTICATE_RESPONSE', payload: {authStatus} }),

        // 5. Inbound messages will often hit the reducer impacting it's state.
        responseReducer: (state, action) => ({ ...state, authStatus: action.payload.authStatus })

    },

    'JOIN_CHAT_LOBBY': {
        action: (user, chatLobbyId) => ({ type: 'JOIN_CHAT_LOBBY', user, chatLobbyId }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                type: action.type,
                payload: { user: action.user, chatLobbyId: action.chatLobbyId }
            }));
        },

        middlewareRecieve: (store, message) => {
            if (message.payload.status === 'success') {
                store.dispatch(responseAct(message.type)(
                    message.payload.chatLobbyId,
                    message.payload.chatLobbyUsers
                ));
            }
        },

        responseAction: (chatLobbyId, chatLobbyUsers) =>
            ({ type: 'JOIN_CHAT_LOBBY_RESPONSE', chatLobbyId, chatLobbyUsers }),

        responseReducer: (state, action) => ({ ...state,
            chatLobbyId: action.chatLobbyId,
            chatLobbyUsers: action.chatLobbyUsers })

    },

    'GET_GAME_CONFIGURATION': {
        action: (chatLobbyId) => ({ type: 'GET_GAME_CONFIGURATION', chatLobbyId }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                type: action.type,
                payload: { chatLobbyId: action.chatLobbyId }
            }));
        },

        responseAction: (payload) => ({ type: 'GET_GAME_CONFIGURATION_RESPONSE', payload }),

        middlewareRecieve: (store, message) => {
            console.log('not really implemented');
            store.dispatch(responseAct(message.type)(message.payload));
        },

        responseReducer: (state, action) => ({ ...state,
            systemsJson: action.payload.systemsJson,
            time: action.payload.time })

    },

    'SET_GAME_CONFIGURATION': {
        action: (chatLobbyId, systemsJson) =>
            ({ type: 'SET_GAME_CONFIGURATION', payload: { chatLobbyId, systemsJson } }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                type: action.type,
                payload: action.payload
            }));
        },

        responseAction: (payload) => ({ type: 'SET_GAME_CONFIGURATION_RESPONSE', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.type)(message.payload));
        },

        responseReducer: (state, action) => ({ ...state, seedOnServer: action.seed })

    },


    ///////////////////////////////
    // Dangled Outbound Messages //
    ///////////////////////////////

    'NEW_MESSAGE': {
        action: (payload) => ({ type: 'NEW_MESSAGE', payload }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                type: action.type,
                payload: action.payload,
            }));
        },

    },

    'LEAVE_CHAT_LOBBY': {
        action: () => ({ type: 'LEAVE_CHAT_LOBBY' }),

        middlewareSend: (action, socket) => {
            socket.send(JSON.stringify({
                type: action.type
            }));
        },
    },


    ///////////////////////////
    // Inbound Only Messages //
    ///////////////////////////

    'SYSTEM_MESSAGE_NEW_MESSAGE': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_NEW_MESSAGE', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.type)(message.payload));
        },

        responseReducer: (state, action) => ({ ...state, messages: [...state.messages, action.payload] })

    },

    'SYSTEM_MESSAGE_USER_JOINED_CHAT': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_USER_JOINED_CHAT', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.type)(message.payload));
        },

        responseReducer: (state, action) => ({ ...state,
            chatLobbyUsers: [ action.payload.displayName , ...state.chatLobbyUsers ] })

    },

    'SYSTEM_MESSAGE_USER_LEFT_CHAT': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_USER_LEFT_CHAT', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.type)(message.payload));
        },

        responseReducer: (state, action) => {
            const chatLobbyUsers = state.chatLobbyUsers.filter(user =>
                user !== action.payload.displayName);
            return { ...state, chatLobbyUsers: [...chatLobbyUsers ] };
        }

    },

    'SYSTEM_MESSAGE_CHAT_USER_LIST': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_CHAT_USER_LIST', payload }),

        middlewareRecieve: (store, message) => {
            store.dispatch(responseAct(message.type)(message.payload));
        },

        responseReducer: (state, action) => ({ ...state, chatLobbyUsers: action.payload })

    },

};

// allows `dispatch(act('AUTHENTICATE')(email, displayName, token))` syntax
export const act = (key) => {
    return actionTable[key].action;
};

export const responseAct = (key) => {
    return actionTable[key.replace(/_RESPONSE$/, '')].responseAction;
};

export function extractActionKey(actionType) {
    const responseSuffix = '_RESPONSE';
    if (actionType.endsWith(responseSuffix))
        return actionType.replace(responseSuffix, '');
    return actionType;
}

///////////////////////////////////////
// Non-Networked store manipulations //
///////////////////////////////////////

const initialState = {
    time: null,
    status: 'UNCONNECTED',
    host: null,
    messages: [],
    chatLobbyId: '',
    chatLobbyUsers: [],
    authStatus: 'UNAUTHENTICATED',
    seedOnServer: '',
    systemsJson: null,
};


/////////////
// REDUCER //
/////////////

export const websocketReducer = (state = { ...initialState }, action) => {

    const responseReducer = actionTable[extractActionKey(action.type)]?.responseReducer;
    if (responseReducer) {
        console.debug('Middleware Reducing: ', action.type);
        return responseReducer(state, action);
    }

    switch (action.type) {
        case 'WS_CONNECTED':
            return { ...state, host: action.host, status: 'WS_CONNECTED' };
        case 'WS_DISCONNECTED':
            return { ...state, status: 'WS_DISCONNECTED' };
        case 'SET_CHAT_LOBBY_ID':
            return { ...state,
                chatLobbyId: action.chatLobbyId
            };
        default:
            if (!action.type.startsWith('@@redux'))
                console.log('websocketReducer: default action: ' + action.type);
            return state;
    }
};

export const selectWebsocket = (state) => state.websocket;
