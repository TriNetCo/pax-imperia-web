import * as actions from '../modules/websocket';
import { actionTable } from '../modules/websocket';

////////////////
// MIDDLEWARE //
////////////////

function extractActionKey(commandName) {
    const responseSuffix = '_RESPONSE';
    if (commandName.endsWith(responseSuffix))
        return commandName.replace(responseSuffix, '');
    return commandName;
}

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
        // console.debug('receiving server message ' + message.command);

        const actionKey = extractActionKey(message.command);
        const middlewareRecieve = actionTable[actionKey]?.middlewareRecieve;

        if (middlewareRecieve) {
            console.debug('receiving server message ' + message.command);
            middlewareRecieve(store, message);
            return;
        }
    };

    // the middleware part of this function
    return store => next => action => {

        const middlewareSend = actionTable[action.type]?.middlewareSend;

        if (middlewareSend) {
            console.debug('Middleware Sending: ', action.type);
            middlewareSend(action, socket);
            return;
        }

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
            default:
                console.debug('the next action:', action);
                return next(action);
        }
    };
};

export default socketMiddleware();
