import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectWebsocket } from '../../modules/websocket';
import ChatMessage from './ChatMessage';

const ChatMessages = () => {
    const dispatch = useDispatch();
    const websocket = useSelector(selectWebsocket);

    // whenever we get a new message and re-render,
    // we need to scroll to the bottom of the chat window
    const messagesScrollerRef = React.useCallback(scroller => {
        if (scroller !== null) {
            scroller.scrollTop = scroller.scrollHeight;
        }
    }, [websocket.messages]);

    return (
        <div className="chat-messages" ref={messagesScrollerRef}>
            { websocket.messages.map((msg, index) => {
                return <ChatMessage key={index} senderName={msg.user} message={msg.message} />;
            })}
        </div>
    );

};

export default ChatMessages;

