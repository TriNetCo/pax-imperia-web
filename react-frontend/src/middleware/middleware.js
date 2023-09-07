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

import * as actions from '../modules/websocket';

const socketMiddleware = () => {
  let socket = null;

  const onOpen = store => (event) => {
    console.log('websocket open', event.target.url);
    store.dispatch(actions.wsConnected(event.target.url));
  };

  const onClose = (store, host) => (event) => {
    store.dispatch(actions.wsDisconnected(host));
  };

  const onMessage = store => (event) => {
    const payload = JSON.parse(event.data);
    // console.log('receiving server message ' + payload.message);

    switch (payload.command) {
      case 'update_game_players':
        // store.dispatch(actions.updateGame(payload.game, payload.current_player));
        break;
      case 'NEW_MESSAGE':
        console.log('received a message', payload.message);
        // when we get a new message, we need to update the store by
        // dispatching an action to the store
        // but we don't dispatch actions.newMessage, because that would result in an infinite loop
        // instead, we dispatch actions.newMessageFromServer
        store.dispatch(actions.newMessageFromServer(payload.message));
        break;
      default:
        break;
    }
  };

  // the middleware part of this function
  return store => next => action => {
    switch (action.type) {
      case 'WS_CONNECT':
        if (socket !== null) {
          socket.close();
        }

        // connect to the remote host
        socket = new WebSocket(action.host);

        // websocket handlers
        socket.onmessage = onMessage(store);
        socket.onclose = onClose(store, action.host);
        socket.onopen = onOpen(store);

        // this interupts the dispatch event for WS_CONNECT completly, so it never hits a reducer...
        // But the onopen callback should be fired, where the store will be set to update
        break;
      case 'WS_DISCONNECT':
        if (socket !== null) {
          socket.close();
        }
        socket = null;
        console.log('websocket closed');
        break;
      case 'NEW_MESSAGE':
        console.log('sending a message', action.msg);
        socket.send(JSON.stringify({ command: 'NEW_MESSAGE', message: action.msg }));
        break;
      default:
        console.log('the next action:', action);
        return next(action);
    }
  };
};

export default socketMiddleware();
