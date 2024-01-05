import { GameDataContext } from 'src/app/Context';
import Galaxy from '../../features/galaxy/Galaxy';
import { useContext } from 'react';

const GalaxyConfigPage = () => {
    const { data, updateData } = useContext(GameDataContext);

    const handleRegenerateSystemBtn = () => {
        data.galaxyWidget.reload();

        updateData({...data});
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
