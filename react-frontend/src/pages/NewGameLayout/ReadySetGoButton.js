import {useHistory} from 'react-router-dom';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useContext} from 'react';


const ReadySetGoButton = () => {
    const history = useHistory();
    const { gameData: data } = useContext(GameDataContext);

    const handlePlayButtonClicked = () => {
        if (data.gameCustomizations.lobbyType == 'multiplayer') {

            if (data.gameCustomizations.isLobbyKing) {
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
        // Respond to SYSTEM_MESSAGE_LAUNCH_GAME in a useEffect

        history.push('/systems/1'); // FIXME: This is just stubbed out like this
        data.gameStateInterface.startClock();
    };

    const readyButtonInstead = () => {
        return data.gameCustomizations.isLobbyKing ? '' : 'ready-button-instead';
    };


    return (
        <li className={`go-button ${readyButtonInstead()}`}
            onClick={handlePlayButtonClicked}></li>
    );
};

export default ReadySetGoButton;
