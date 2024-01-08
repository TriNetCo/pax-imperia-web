import PropTypes from 'prop-types';


const LobbyEntry = ({lobby}) => {
    const handleJoinClicked = () => {
        // navigate to /games/lobby.id
    };

    return (
        <div className="lobby-entry">
            <span>{lobby.name}</span>
            <span>1/4</span>
            <button onClick={handleJoinClicked}>Join</button>
        </div>
    );
};

LobbyEntry.propTypes = {
    lobby: PropTypes.object.isRequired,
};

export default LobbyEntry;
