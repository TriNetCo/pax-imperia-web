import { GameDataContext } from 'src/app/GameDataContextProvider';
import Galaxy from '../../../features/Galaxy/Galaxy';
import { useContext } from 'react';
import {useHistory} from 'react-router-dom';

const GalaxyConfigPage = () => {
    const { data, updateData } = useContext(GameDataContext);
    const history = useHistory();

    const handleRegenerateSystemBtn = () => {
        data.initNewGame();
        data.gameStateInterface.startClock();
        updateData();
    };

    return (
        <>
            <h1>GalaxyConfig Page</h1>

            <div>
                <div id="lower-console"></div>

                <Galaxy />
            </div>

            <button onClick={handleRegenerateSystemBtn}>
                Re-Generate System
            </button>

            <div>
                TODO:  Add slider bars and cool stuff to this page!!!
            </div>
        </>
    );
};

export default GalaxyConfigPage;
