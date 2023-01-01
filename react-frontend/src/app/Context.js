import React, { useEffect } from 'react';
import { bindActionCreators } from "redux";
import { connect, useDispatch } from 'react-redux';
import { wsConnect, wsDisconnect } from '../modules/websocket';
import { UserContextProvider } from './UserContextProvider';

export const GameDataContext = React.createContext(null);

const websocketPort = "3001";
export const connectAndJoin = (dispatch) => {
  const host = `ws://127.0.0.1:${websocketPort}/websocket`;

  // This is where we start using the websocket middleware...
  dispatch(wsConnect(host));
};
export const disconnect = (dispatch) => {
  dispatch(wsDisconnect())
}

const Context = (props) => {
  const dispatch = useDispatch();

  useEffect( () => {
    connectAndJoin(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <UserContextProvider value={props.userContext}>
        <GameDataContext.Provider value={props.gameData}>
          {props.children}
        </GameDataContext.Provider>
      </UserContextProvider>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      wsConnect: bindActionCreators(wsConnect, dispatch),
      wsDisconnect: bindActionCreators(wsDisconnect, dispatch),
    },
  };
}

export default connect(mapDispatchToProps)(Context);
