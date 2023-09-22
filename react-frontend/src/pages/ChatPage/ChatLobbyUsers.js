import React from 'react';
import { useSelector } from 'react-redux';
import { selectWebsocket } from '../../modules/websocket';

const ChatLobbyUsers = () => {
    const websocket = useSelector(selectWebsocket);

    return (
        <div className="chat-users">
            { websocket.chatLobbyUsers.map((user, index) => {
                return <div className="chat-user" key={index}>{user}</div>;
            })}
        </div>

    );

};

export default ChatLobbyUsers;

