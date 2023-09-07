import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { newMessage, selectWebsocket } from '../../modules/websocket';
import ChatMessages from './ChatMessages';

const ChatLobby = () => {

  const [msgToSend, setMsgToSend] = useState('');
  const dispatch = useDispatch();
  const websocket = useSelector(selectWebsocket);

  const currentUser = 'User1';

  const sendMessage = () => {
    const outboundMsg = {
      message: msgToSend,
      user: currentUser
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

  return (
    <div className="chat-lobby">
      <div>Connection Status: { websocket.status } </div>

      <div className="chat-lobby-header">Lobby</div>
      <div className="chat-users">
        <div className="chat-user">User1</div>
        <div className="chat-user">User2</div>
      </div>
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
