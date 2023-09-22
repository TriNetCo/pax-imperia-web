import { Link } from 'react-router-dom';
import { GameDataContext } from 'src/app/Context';
import {useContext} from 'react';

const SingleOrMultiplayerPage = () => {

    const data = useContext(GameDataContext);

    return (
        <>
            <div>
                {/* The player uses the radio button interface to choose single or multiplayer game */}
                <div>
                    <h3>Game Type</h3>
                    <div>
                        <input type="radio" id="singleplayer" name="gameType" value="singleplayer" />
                        <label htmlFor="singleplayer">Singleplayer</label>
                    </div>
                    <div>
                        <input type="radio" id="multiplayer" name="gameType" value="multiplayer" />
                        <label htmlFor="multiplayer">Multiplayer</label>
                    </div>
                </div>
                <div>
                    <Link to="/new_game/colonizer_config">Next</Link>
                </div>
            </div>
        </>
    );
};

export default SingleOrMultiplayerPage;
