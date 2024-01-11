import React from 'react';
import { render, fireEvent, screen } from '../../tools/test-utils';
import ChatLobby from 'src/pages/ChatPage/ChatLobby';
import {act, websocketReducer, wsConnect} from './websocket';

const rootReducer = { websocket: websocketReducer };

describe('sendMessage middleware', () => {
    let mockWebSocket;
    let sendSpy;

    it('dispatches the correct action and sends message via WebSocket', () => {

        // Render your component with the mocked context
        const { sendSpy, store } = render(<ChatLobby />, { rootReducer })

        const msg = {
            "message": "",
            "user": "Anonymous",
            "userEmail": "Anonymous@example.com",
            "chatLobbyId": ""
        }

        store.dispatch(act('NEW_MESSAGE')(msg))

        expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({
            "type": "NEW_MESSAGE",
            payload: msg
        }));

        // expect(middlewareActionLeger.length).toEqual(2)
        // expect(middlewareActionLeger[0].type).toEqual('WS_CONNECT')
        // expect(middlewareActionLeger[1].type).toEqual('NEW_MESSAGE')
    });
});
