import { useHistory } from 'react-router-dom';
import NewGameBreadCrumb from './NewGameBreadCrumb';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useContext} from 'react';

const ColonizerConfigPage = () => {
    const { data, updateData } = useContext(GameDataContext);

    const history = useHistory();

    const handleDefaultClick = () => {
        data.galaxyCustomizations.species = 'telepathic';
        history.push('/new_game/galaxy_config');
    };

    return (
        <>
            <h1>ColonizerConfig Page</h1>
            <div>
                <button onClick={handleDefaultClick}>Choose default telepathic species</button>
            </div>
            <div>
                <button>Design species (disabled)</button>
            </div>
        </>
    );
};

export default ColonizerConfigPage;
