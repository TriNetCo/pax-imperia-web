import { useState, useContext, useEffect } from 'react';
import UserContext from '../../app/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {selectWebsocket, act} from '../../modules/websocket';
import ChatMessages from './ChatMessages';
import ChatLobbyUsers from './ChatLobbyUsers';
import { GameDataContext } from 'src/app/GameDataContextProvider';
import PropTypes from 'prop-types';

import './ChatLobby.css';

const ChatLobby = ({closeModal}) => {
    const history = useHistory();
    const [msgToSend, setMsgToSend] = useState('');
    const dispatch = useDispatch();
    const websocket = useSelector(selectWebsocket);
    const userContext = useContext(UserContext);
    const { gameData: data } = useContext(GameDataContext);

    // Whenever websocket.systemsJson changes to something, import
    // that to our galaxyWidget automatically
    useEffect(() => {
        if (!websocket.systemsJson) {
            return;
        }
        data.galaxyWidget.importGalaxyData(websocket.systemsJson);
    }, [websocket.systemsJson]);

    const sendMessage = () => {
        const outboundMsg = {
            message: msgToSend,
            user: userContext.displayName ? userContext.displayName : 'Anonymous',
            email: userContext.email,
            chatLobbyId: websocket.chatLobbyId,
        };
        dispatch(act('NEW_MESSAGE')(outboundMsg));
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

    const leaveLobby = () => {
        dispatch(act('LEAVE_CHAT_LOBBY')());
        data.clear();
        history.push('/new_game');
    };

    return (
        <div className="chat-lobby">
            { closeModal ?
                <span className="close" onClick={closeModal}>&times;</span> : '' }

            <div className="lobby-label">
                Lobby ID:
                <input type="text" value={websocket.chatLobbyId} disabled />

                { closeModal ? '' :
                    <button className="leave-lobby-btn" onClick={leaveLobby}>Leave Lobby</button> }
            </div>

            { (websocket.status !== 'UNCONNECTED') &&
              (websocket.status !== 'WS_CONNECTED') ?
                <div>Connection Status: { websocket.status } </div> : '' }

            { (websocket.status === 'WS_CONNECTED') &&
              (websocket.authStatus !== 'AUTHENTICATED') ?
                <div>Authentication Status: { websocket.authStatus } </div> : '' }

            {/* <div>websocket.systemsJson: { !websocket.systemsJson ? 'NULL' : 'POPULATED' }</div> */}

            {/* <div>
                Current User:
                <input className="edit-username-field" disabled={true} type="text" value={userContext.displayName} onChange={handleChangeCurrentUser} />
                <button className="edit-username-btn" onClick={enableEditButton} >Edit</button>
            </div> */}

            <div className="chat-lobby-header">Chat Lobby</div>
            <ChatLobbyUsers />
            <ChatMessages />
            <div className="chat-input">
                <input type="text" value={msgToSend} onChange={handleMessageChange}
                    onKeyDown={handleEnterKey} placeholder="Type a message..."
                    data-testid="msg-field" />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};


ChatLobby.propTypes = {
    closeModal: PropTypes.func,
};

export default ChatLobby;
