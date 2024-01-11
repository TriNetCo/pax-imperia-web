import React from 'react';
import { render, fireEvent, screen } from '../../tools/test-utils';
import ChatLobby from 'src/pages/ChatPage/ChatLobby';
import {act, websocketReducer, wsConnect} from './websocket';

const rootReducer = { websocket: websocketReducer };

describe('sendMessage middleware', () => {
    let mockWebSocket;
    let sendSpy;

    it('NEW_MESSAGE dispatches send to WebSocket', () => {
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
    });

    it('LEAVE_CHAT_LOBBY dispatches send to WebSocket', () => {
        // Render your component with the mocked context
        const { sendSpy, store } = render(<ChatLobby />, { rootReducer })

        store.dispatch(act('LEAVE_CHAT_LOBBY')())

        expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({
            "type": "LEAVE_CHAT_LOBBY"
        }));
    });
});
