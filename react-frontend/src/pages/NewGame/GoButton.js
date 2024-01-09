import {useHistory} from 'react-router-dom';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useContext} from 'react';


const GoButton = () => {
    const history = useHistory();
    const { data } = useContext(GameDataContext);

    const handlePlayButtonClicked = () => {
        if (data.galaxyCustomizations.lobbyType == 'multiplayer') {

            if (data.galaxyCustomizations.isLobbyKing) {
                launchMultiplayerGame();
            }
            return;
        }

        data.gameStateInterface.startClock();

        // else go to singleplayer game
        history.push('/systems/1');
    };

    const launchMultiplayerGame = () => {
        // Send a REQUEST_LAUNCH_GAME message to the server
        // Respond to SYSTEM_LAUNCH_GAME in a useEffect

    };

    const readyButtonInstead = () => {
        return data.galaxyCustomizations.isLobbyKing ? '' : 'ready-button-instead';
    };


    return (
        <li className={`go-button ${readyButtonInstead()}`}
            onClick={handlePlayButtonClicked}></li>
    );
};

export default GoButton;
