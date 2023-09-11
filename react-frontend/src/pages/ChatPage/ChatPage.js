import React, { useState } from 'react';
import UserCard from 'src/shared/UserCard/UserCard';
import ChatLobby from './ChatLobby';
import ChatLobbyControls from './ChatLobbyControls';
import './ChatPage.css';
// import { selectWebsocket } from 'src/modules/websocket';
// import { useSelector } from 'react-redux';


// A ChatPage is a link to a chat room with galaxy data that the owner can define
const ChatPage = () => {
//   const websocket = useSelector(selectWebsocket);

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
