import React, { useState, useContext } from 'react';
import UserContext from '../../app/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import {newMessage, selectWebsocket, authenticate, joinChatLobby} from '../../modules/websocket';
import ChatMessages from './ChatMessages';
import ChatLobbyUsers from './ChatLobbyUsers';
import { GameDataContext } from 'src/app/Context';

const ChatLobby = () => {

    const [msgToSend, setMsgToSend] = useState('');
    const dispatch = useDispatch();
    const websocket = useSelector(selectWebsocket);
    const userContext = useContext(UserContext);
    const data = useContext(GameDataContext);

    const sendMessage = () => {
        const outboundMsg = {
            message: msgToSend,
            user: userContext.displayName,
            userEmail: userContext.email,
            chatLobbyId: websocket.chatLobbyId,
        };
        dispatch(newMessage(outboundMsg));
        setMsgToSend('');
    };

    const handleMessageChange = event => {
        setMsgToSend(event.target.value);
    };

    const handleEnterKey = event => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const handleChangeCurrentUser = event => {
        userContext.displayName = event.target.value;
    };

    const enableEditButton = () => {
        const fieldElement = document.getElementsByClassName('edit-username-field')[0];
        const buttonElement = document.getElementsByClassName('edit-username-btn')[0];
        const fieldEnabled = fieldElement.disabled;
        if (fieldEnabled) {
            fieldElement.disabled = false;
            buttonElement.innerHTML = 'Save';
        } else {
            fieldElement.disabled = true;
            buttonElement.innerHTML = 'Edit';
        }
    };

    return (
        <div className="chat-lobby">
            <div>Lobby ID: { websocket.chatLobbyId }</div>
            <div>Connection Status: { websocket.status } </div>
            <div>Authentication Status: { websocket.authenticationStatus } </div>
            <div>chatLobbyUsers: { websocket.chatLobbyUsers }</div>
            {/* We need a way to set our username for debugging */}
            <div>
        Current User:
                <input className="edit-username-field" disabled={true} type="text" value={userContext.displayName} onChange={handleChangeCurrentUser} />
                <button className="edit-username-btn" onClick={enableEditButton} >Edit</button>
            </div>

            <div className="chat-lobby-header">Lobby</div>
            <ChatLobbyUsers />
            <ChatMessages />
            <div className="chat-input">
                <input type="text" value={msgToSend} onChange={handleMessageChange}
                    onKeyDown={handleEnterKey} placeholder="Type a message..." />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatLobby;
