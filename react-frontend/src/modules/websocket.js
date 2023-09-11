export const wsConnect = host => ({ type: 'WS_CONNECT', host });
export const wsDisconnect = host => ({ type: 'WS_DISCONNECT', host });

export const wsConnected = host => ({ type: 'WS_CONNECTED', host });
export const wsDisconnected = host => ({ type: 'WS_DISCONNECTED', host });
export const wsError = host => ({ type: 'WS_ERROR', host });

export const newMessage = payload => ({ type: 'NEW_MESSAGE', payload });
export const newMessageFromServer = data => ({ type: 'NEW_MESSAGE_FROM_SERVER', data });
export const updateGame = (json, player) => ({ type: 'SET_GAME', data: json, player });
export const joinChatLobby = (user, chatLobbyId) => ({ type: 'JOIN_CHAT_LOBBY', user, chatLobbyId });
export const joinChatLobbyResponse = (chatLobbyId, chatLobbyUsers) => ({ type: 'JOIN_CHAT_LOBBY_RESPONSE', chatLobbyId, chatLobbyUsers });
export const authenticate = (email, displayName, token) => ({ type: 'AUTHENTICATE', email, displayName, token });
export const authenticateResponse = (status) => ({ type: 'AUTHENTICATE_RESPONSE', status });
export const systemMessageUserJoinedChat = (payload) => ({ type: 'SYSTEM_MESSAGE_USER_JOINED_CHAT', payload });
export const systemMessageChatUserList = (payload) => ({ type: 'SYSTEM_MESSAGE_CHAT_USER_LIST', payload });
export const setGameConfiguration = (chatLobbyId, systemsJson) => ({ type: 'SET_GAME_CONFIGURATION', payload: { chatLobbyId, systemsJson } });
export const getGameConfiguration = (chatLobbyId) => ({ type: 'GET_GAME_CONFIGURATION', chatLobbyId });
export const getGameConfigurationResponse = (payload) => ({ type: 'GET_GAME_CONFIGURATION_RESPONSE', payload });

const initialState = {
  time: null,
  status: null,
  host: null,
  messages: [],
  chatLobbyId: null,
  chatLobbyUsers: [],
  authenticationStatus: 'UNAUTHENTICATED',
  systemsJson: null,
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
    case 'JOIN_CHAT_LOBBY_RESPONSE':
      return { ...state, chatLobbyId: action.chatLobbyId, chatLobbyUsers: action.chatLobbyUsers };
    case 'SYSTEM_MESSAGE_USER_JOINED_CHAT':
      return { ...state, chatLobbyUsers: [...state.chatLobbyUsers, action.payload.displayName ] };
    case 'SYSTEM_MESSAGE_CHAT_USER_LIST':
      return { ...state, chatLobbyUsers: action.payload };
    case 'AUTHENTICATE_RESPONSE':
      return { ...state, authenticationStatus: action.status };
    case 'GET_GAME_CONFIGURATION_RESPONSE':
      return { ...state, systemsJson: action.payload.systemsJson, time: action.payload.time };
    default:
      console.log('websocketReducer: default action: ' + action.type);
      return state;
  }
};

export const selectWebsocket = (state) => state.websocket;

