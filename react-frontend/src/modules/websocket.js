export const wsConnect = host => ({ type: 'WS_CONNECT', host });
export const wsDisconnect = host => ({ type: 'WS_DISCONNECT', host });

export const wsConnected = host => ({ type: 'WS_CONNECTED', host });
export const wsDisconnected = host => ({ type: 'WS_DISCONNECTED', host });
export const wsError = host => ({ type: 'WS_ERROR', host });

export const newMessage = data => ({ type: 'NEW_MESSAGE', data });
export const newMessageFromServer = data => ({ type: 'NEW_MESSAGE_FROM_SERVER', data });
export const acceptJoinChatLobby = chatLobbyId => ({ type: 'ACCEPT_JOIN_CHAT_LOBBY', chatLobbyId });
export const updateGame = (json, player) => ({ type: 'SET_GAME', data: json, player });
export const joinChatLobby = (user, chat_lobby_id) => ({ type: 'JOIN_CHAT_LOBBY', user, chat_lobby_id });

const initialState = {
  time: null,
  status: null,
  host: null,
  messages: [],
  chatLobbyId: null,
};

export const websocketReducer = (state = { ...initialState }, action) => {
  switch (action.type) {
    case 'WS_CONNECTED':
      return { ...state, host: action.host, status: 'WS_CONNECTED' };
    case 'WS_DISCONNECTED':
      return { ...state, status: 'WS_DISCONNECTED' };
    case 'SET_GAME':
      return { ...state, game: action.data, current_player: action.player };
    case 'NEW_MESSAGE_FROM_SERVER':
      return { ...state, messages: [...state.messages, action.data] };
    case 'ACCEPT_JOIN_CHAT_LOBBY':
      return { ...state, chatLobbyId: action.chatLobbyId };
    default:
      console.log('websocketReducer: default action: ' + action.type);
      return state;
  }
};

export const selectWebsocket = (state) => state.websocket;

