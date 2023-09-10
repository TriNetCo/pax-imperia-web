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
import {systemMessageUserJoinedChat} from '../modules/websocket';

const socketMiddleware = () => {
  let socket = null;

  const onOpen = store => (event) => {
    console.debug('websocket open', event.target.url);
    store.dispatch(actions.wsConnected(event.target.url));
  };

  const onClose = (store, host) => (event) => {
    store.dispatch(actions.wsDisconnected(host));
  };

  const onMessage = store => (event) => {
    const message = JSON.parse(event.data);
    console.debug('receiving server message ' + message.command);

    switch (message.command) {
      case 'SYSTEM_MESSAGE_CHAT_USER_LIST':
        store.dispatch(actions.systemMessageChatUserList(message.payload));
        break;
      case 'SYSTEM_MESSAGE_USER_JOINED_CHAT':
        store.dispatch(actions.systemMessageUserJoinedChat(message.payload));
        break;
      case 'JOIN_CHAT_LOBBY_RESPONSE':
        if (message.payload.status === 'success') {
          console.debug('JOIN_CHAT_LOBBY_RESPONSE', message);
          store.dispatch(actions.joinChatLobbyResponse(message.payload.chatLobbyId, message.payload.chatLobbyUsers));
        }
        break;
      case 'AUTHENTICATE_RESPONSE':
        console.debug('AUTHENTICATE_RESPONSE', message.payload.status);
        store.dispatch(actions.authenticateResponse(message.payload.status));
        break;
      case 'update_game_players':
        // store.dispatch(actions.updateGame(message.game, message.current_player));
        break;
      case 'NEW_MESSAGE':
        // when we get a new message, we need to update the store by
        // dispatching an action to the store
        // but we don't dispatch actions.newMessage, because that would result in an infinite loop
        // instead, we dispatch actions.newMessageFromServer
        store.dispatch(actions.newMessageFromServer(message.payload));
        console.debug('received a message', message.payload.message);
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
        console.debug('sending a message ', action.data);
        socket.send(JSON.stringify({
          command: 'NEW_MESSAGE',
          payload: action.data,
        }));
        break;
      case 'JOIN_CHAT_LOBBY':
        console.debug('joining chat lobby ', action.chat_lobby_id);
        socket.send(JSON.stringify({
          command: 'JOIN_CHAT_LOBBY',
          payload: { user: action.user, chat_lobby_id: action.chat_lobby_id }
        }));
        break;
      case 'AUTHENTICATE':
        console.debug('authenticating ', action.email);
        socket.send(JSON.stringify({
          command: 'AUTHENTICATE',
          payload: { email: action.email, displayName: action.displayName, token: action.token }
        }));
        break;
      default:
        console.debug('the next action:', action);
        return next(action);
    }
  };
};

export default socketMiddleware();
