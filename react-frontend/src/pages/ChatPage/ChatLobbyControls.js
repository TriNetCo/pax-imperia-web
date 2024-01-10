import {useState, useContext} from 'react';
import UserContext from '../../app/UserContext';
import {useSelector, useDispatch} from 'react-redux';
import {selectWebsocket, joinChatLobby, act} from '../../modules/websocket';


const ChatLobbyControls = () => {

    const websocket = useSelector(selectWebsocket);
    const dispatch = useDispatch();
    const userContext = useContext(UserContext);
    const [currentChatLobby, setCurrentChatLobby] = useState(null);

    const handleChatLobbyIdChange = event => {
        setCurrentChatLobby(event.target.value);
    };

    const handleJoinLobbyClick = () => {
        dispatch(joinChatLobby(userContext.email, currentChatLobby));
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
