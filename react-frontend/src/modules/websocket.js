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
export const wsConnect = (host, authData) => ({ type: 'WS_CONNECT', host, authData });

// When the connection is actually established from wsConnect,
// this action is dispatched so the store knows the connection status
export const wsConnected = host => ({ type: 'WS_CONNECTED', host });

// This isn't used, but would be required for load balancing
export const wsDisconnect = host => ({ type: 'WS_DISCONNECT', host });
export const wsDisconnected = host => ({ type: 'WS_DISCONNECTED', host });


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

        // 1. The action is called to initiate the messaging cycle, e.g. dispatch(act('AUTHENTICATE')(email, displayName, token))
        action: (email, displayName, token) =>
            ({ type: 'AUTHENTICATE', payload: { email, displayName, token } }),

        // 2. Once the action is disptached, the middleware will receive the 'AUTHENTICATE'
        //  which will lookup the action defined above and in it's presence send to the socket
        // middlewareSend: (action, socket) => socket.send(JSON.stringify(action)),

        // 3. The middleware will fire this function when an AUTHENTICATE_RESPONSE message
        // comes in which will then dispatch the responseAction leading to the reducer
        // dealing with the rest
        // AUTHENTICATE_RESPONSE
        middlewareRecieve: (store, message) => { store.dispatch(message); },

        // 4. Responses to AUTHENTICATE are defined here, but will come in as
        // It turned out this extra action definition wasn't helpful since we
        // can dispatch the messages raw from the server
        // responseAction: (authStatus) => ({ type: 'AUTHENTICATE_RESPONSE', payload: {authStatus} }),

        // 5. Inbound messages will often hit the reducer impacting it's state.
        responseReducer: (state, action) => ({ ...state, ...action.payload })

    },

    'CREATE_CHAT_LOBBY': {
        action: (isPrivate) => ({ type: 'CREATE_CHAT_LOBBY', payload: { isPrivate } }),

        middlewareRecieve: (store, message) => { store.dispatch(message); },

        responseReducer: (state, action) => ({ ...state, ...action.payload })
    },

    'JOIN_CHAT_LOBBY': {
        action: (user, chatLobbyId) => ({ type: 'JOIN_CHAT_LOBBY', payload: { user, chatLobbyId } }),

        // JOIN_CHAT_LOBBY_RESPONSE
        middlewareRecieve: (store, message) => {
            if (message.status === 'success') {
                store.dispatch(message);
            }
        },

        responseReducer: (state, action) => ({ ...state, ...action.payload })

    },

    'GET_GAME_CONFIGURATION': {
        action: (chatLobbyId) => ({ type: 'GET_GAME_CONFIGURATION', payload: { chatLobbyId } }),

        responseAction: (payload) => ({ type: 'GET_GAME_CONFIGURATION_RESPONSE', payload }),

        middlewareRecieve: (store, message) => { store.dispatch(message); },

        responseReducer: (state, action) => ({ ...state, ...action.payload })

    },

    'SET_GAME_CONFIGURATION': {
        action: (chatLobbyId, systemsJson) =>
            ({ type: 'SET_GAME_CONFIGURATION', payload: { chatLobbyId, systemsJson } }),

        responseAction: (payload) => ({ type: 'SET_GAME_CONFIGURATION_RESPONSE', payload }),

        middlewareRecieve: (store, message) => { store.dispatch(message); },

        responseReducer: (state, action) => ({ ...state, ...action.payload })

    },


    ///////////////////////////////
    // Dangled Outbound Messages //
    ///////////////////////////////

    'NEW_MESSAGE': {
        action: (payload) => ({ type: 'NEW_MESSAGE', payload }),
    },

    'LEAVE_CHAT_LOBBY': {
        action: () => ({ type: 'LEAVE_CHAT_LOBBY' }),
    },


    ///////////////////////////
    // Inbound Only Messages //
    ///////////////////////////

    'SYSTEM_MESSAGE_NEW_MESSAGE': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_NEW_MESSAGE', payload }),

        middlewareRecieve: (store, message) => { store.dispatch(message); },

        responseReducer: (state, action) => ({ ...state,
            messages: [...state.messages, action.payload] })
    },

    'SYSTEM_MESSAGE_USER_JOINED_CHAT': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_USER_JOINED_CHAT', payload }),

        middlewareRecieve: (store, message) => { store.dispatch(message); },

        responseReducer: (state, action) => ({ ...state,
            chatLobbyUsers: [ ...state.chatLobbyUsers, action.payload.displayName ] })

    },

    'SYSTEM_MESSAGE_USER_LEFT_CHAT': {
        responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_USER_LEFT_CHAT', payload }),

        middlewareRecieve: (store, message) => { store.dispatch(message); },

        responseReducer: (state, action) => {
            const chatLobbyUsers = state.chatLobbyUsers.filter( user =>
                user !== action.payload.displayName);
            return { ...state, chatLobbyUsers };
        }

    },

    // This would only be useful in a UDP setup
    // 'SYSTEM_MESSAGE_CHAT_USER_LIST': {
    //     responseAction: (payload) => ({ type: 'SYSTEM_MESSAGE_CHAT_USER_LIST', payload }),
    //     middlewareRecieve: (store, message) => { store.dispatch(message); },
    //     responseReducer: (state, action) => ({ ...state, ...action.payload })
    // },

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
