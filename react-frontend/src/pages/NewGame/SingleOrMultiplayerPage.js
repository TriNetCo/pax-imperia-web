import { Link } from 'react-router-dom';
import { GameDataContext } from 'src/app/GameDataContextProvider';
import {useContext} from 'react';

const SingleOrMultiplayerPage = () => {

    const { data, updateData } = useContext(GameDataContext);

    return (
        <div className='players-menu'>
            <div>
                <Link to="/new_game/colonizer_config">Singleplayer</Link>
            </div>

            <div>
                <Link to="/new_game/multiplayer">Host Multiplayer</Link>
            </div>

            <div>
                <Link to="/lobbies">Join Multiplayer</Link>
            </div>
        </div>
    );
};

export default SingleOrMultiplayerPage;
