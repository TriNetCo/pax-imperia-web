export const wsConnect = host => ({ type: 'WS_CONNECT', host });
export const wsDisconnect = host => ({ type: 'WS_DISCONNECT', host });

export const wsConnected = host => ({ type: 'WS_CONNECTED', host });
export const wsDisconnected = host => ({ type: 'WS_DISCONNECTED', host });
export const wsError = host => ({ type: 'WS_ERROR', host });

// NEW_MESSAGE...
export const newMessage = msg => ({ type: 'NEW_MESSAGE', msg });
export const updateGame = (json, player) => ({ type: 'SET_GAME', data: json, player });

const initialState = {
  time: null,
  status: null,
  host: null
};

export const websocketReducer = (state = { ...initialState }, action) => {
  switch (action.type) {
    case 'WS_CONNECTED':
      return { ...state, host: action.host, status: 'WS_CONNECTED' };
    case 'WS_DISCONNECTED':
      return { ...state, status: 'WS_DISCONNECTED' };
    case 'SET_GAME':
      return { ...state, game: action.data, current_player: action.player };
    default:
      return state;
  }
};

export const selectWebsocket = (state) => state.websocket;

