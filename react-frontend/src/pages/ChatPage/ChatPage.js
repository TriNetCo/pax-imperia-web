import React, { useState } from 'react';
import UserCard from 'src/shared/UserCard/UserCard';
import ChatLobby from './ChatLobby';
import ChatLobbyControls from './ChatLobbyControls';
import './ChatPage.css';
// import { selectWebsocket } from 'src/modules/websocket';
// import { useSelector } from 'react-redux';

const ChatPage = () => {
//   const websocket = useSelector(selectWebsocket);

  return (
    <div className="page-wrap">
      <div id="generic-app-parent" className="title-screen">
        <div className="wrap-block"></div>
        <UserCard />

        {/* { websocket.chatLobbyId ?
          <ChatLobby /> :
          <ChatLobbyControls /> } */}
        <ChatLobbyControls />

        <ChatLobby />

      </div>
    </div>
  );
};

export default ChatPage;
