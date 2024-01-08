import UserCard from 'src/shared/UserCard/UserCard';
import './LobbiesPage.css';
import LobbyEntry from './LobbyEntry';

const LobbiesPage = () => {

    const lobbies = [
        {
            name: 'My Cool Lobby',
            id: '1234',
        }
    ];

    return (
        <>
            <UserCard />
            <div className="newgame-wrap">
                <div className="big-header">Multiplayer Games</div>

                <div>
                    <div>Enter Lobby Code</div>
                    <input type="text"></input>
                    <button>Search (disabled)</button>
                </div>

                <div className="lobbies-listing">
                    { lobbies.map( (lobby, index) => {
                        return (<LobbyEntry key={index} lobby={lobby} />);
                    })}
                </div>
            </div>
        </>
    );
};

export default LobbiesPage;
