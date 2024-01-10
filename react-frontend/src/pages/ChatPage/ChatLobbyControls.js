import {useState, useContext} from 'react';
import UserContext from '../../app/UserContext';
import {useSelector, useDispatch} from 'react-redux';
import {selectWebsocket, act} from '../../modules/websocket';


const ChatLobbyControls = () => {

    const websocket = useSelector(selectWebsocket);
    const dispatch = useDispatch();
    const userContext = useContext(UserContext);
    const [chatLobbyId, setChatLobbyId] = useState(null);

    const handleChatLobbyIdChange = event => {
        setChatLobbyId(event.target.value);
    };

    const handleJoinLobbyClick = () => {
        dispatch(act('JOIN_CHAT_LOBBY')(userContext.email, chatLobbyId));
    };

    const handleAuthenticateClick = () => {
        dispatch(act('AUTHENTICATE')(userContext.email, userContext.displayName, userContext.token));
    };

    return (
        <div className="chat-lobby-controls">
            <div className="chat-lobby-title">Chat Lobby Controls</div>

            <div className='flexy-container'>
                <div className="chat-lobby-input">
                    <button onClick={handleAuthenticateClick}>Authenticate</button>
                </div>

                <div className="chat-lobby-input">
                    <input type="text" onChange={handleChatLobbyIdChange} placeholder="Enter a chat lobby name" />
                    <button onClick={handleJoinLobbyClick}>Join</button>
                </div>

                <div className="chat-lobby-input">
                    <button>Create New Chat Lobby</button>
                </div>
            </div>
        </div>
    );
};

export default ChatLobbyControls;
