import React, { useState } from 'react';
import UserCard from 'src/shared/UserCard/UserCard';
import ChatLobby from './ChatLobby';
import ChatLobbyControls from './ChatLobbyControls';
import './ChatPage.css';

const ChatPage = () => {

  return (
    <div className="page-wrap">
      <div id="generic-app-parent" className="title-screen">
        <div className="wrap-block"></div>
        <UserCard />

        <ChatLobbyControls />

        <ChatLobby />
      </div>
    </div>
  );
};

export default ChatPage;
