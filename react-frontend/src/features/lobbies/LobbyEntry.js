import PropTypes from 'prop-types';
import {useHistory} from 'react-router-dom';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useContext} from 'react';


const LobbyEntry = ({lobby}) => {
    const history = useHistory();
    const { data } = useContext(GameDataContext);

    const handleJoinClicked = () => {
        // navigate to /games/lobby.id
        data.galaxyCustomizations.lobbyType = 'multiplayer';
        history.push(`/new_game/lobbies/${lobby.chatLobbyId}`);
    };

    return (
        <div className="lobby-entry">
            <span>{lobby.name}</span>
            <span>{lobby.clients.length}/4</span>
            <button onClick={handleJoinClicked}>Join</button>
        </div>
    );
};

LobbyEntry.propTypes = {
    lobby: PropTypes.object.isRequired,
};

export default LobbyEntry;
