import { useHistory } from 'react-router-dom';
import { GameDataContext } from 'src/app/GameDataContextProvider';
import {useContext} from 'react';

// eslint-disable-next-line react/prop-types
const NiceButton = ({path, lobbyType, callback, children}) => {
    const { data, updateData } = useContext(GameDataContext);
    const history = useHistory();

    const handleClick = () => {
        if (callback) {
            callback();
        }
        data.galaxyCustomizations.lobbyType = lobbyType;
        history.push(path);
    };

    return (
        <div>
            <button onClick={handleClick}>
                {children}
            </button>
        </div>
    );
};

const SingleOrMultiplayerPage = () => {
    const { data, updateData } = useContext(GameDataContext);

    const clearOldGame = () => {
        data.initNewGame();
    };

    const createMultiplayerLobby = () => {

    };

    return (
        <div className="players-menu">
            <NiceButton
                path="/new_game/colonizer_config"
                lobbyType='singleplayer'
                callback={ clearOldGame }>
                Singleplayer
            </NiceButton>

            <NiceButton path="/new_game/lobbies" lobbyType='multiplayer'
                callback={ createMultiplayerLobby }>
                Host Multiplayer
            </NiceButton>

            <NiceButton path="/lobbies">
                Join Multiplayer
            </NiceButton>
        </div>
    );
};

export default SingleOrMultiplayerPage;
