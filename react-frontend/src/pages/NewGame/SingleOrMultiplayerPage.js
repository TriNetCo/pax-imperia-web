import { useHistory } from 'react-router-dom';
import { GameDataContext } from 'src/app/GameDataContextProvider';
import { useContext } from 'react';

// eslint-disable-next-line react/prop-types
const NiceButton = ({path, callback, children}) => {
    const history = useHistory();

    const handleClick = () => {
        if (callback) {
            callback();
        }
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
    const { data } = useContext(GameDataContext);

    // TODO: move to useEffect on singleplayer page
    const createSingleplayerLobby = () => {
        data.initNewGame();
        data.galaxyCustomizations.lobbyType = 'singleplayer';
    };

    return (
        <div className="players-menu">
            <NiceButton path="/new_game/colonizer_config" callback={ createSingleplayerLobby }>
                Singleplayer
            </NiceButton>

            <NiceButton path="/new_game/lobbies">
                Host Multiplayer
            </NiceButton>

            <NiceButton path="/lobbies">
                Join Multiplayer
            </NiceButton>
        </div>
    );
};

export default SingleOrMultiplayerPage;
