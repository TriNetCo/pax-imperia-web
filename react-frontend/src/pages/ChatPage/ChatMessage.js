import React from 'react';
import PropTypes from 'prop-types';

const ChatMessage = ({senderName, message}) => {
  return (
    <div className="chat-message">
      <div className="chat-message-user">{senderName}</div>
      <div className="chat-message-text">{message}</div>
    </div>
  );
};

ChatMessage.propTypes = {
  senderName: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired
};

export default ChatMessage;
