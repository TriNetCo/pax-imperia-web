import React, { useState } from 'react';

const ChatLobbyControls = () => {

  const [currentChatLobby, setCurrentChatLobby] = useState(null);

  return (
    <div className="chat-lobby-controls">
      <div className="chat-lobby-title">Chat Lobby Controls</div>

      <div className='flexy-container'>
        <div className="chat-lobby-input">
          <input type="text" placeholder="Enter a chat lobby name" />
          <button>Join</button>
        </div>

        <div className="chat-lobby-input">
          <button>Create New Chat Lobby</button>
        </div>
      </div>
    </div>
  );
};

export default ChatLobbyControls;
