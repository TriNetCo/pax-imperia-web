import {Link, useHistory} from 'react-router-dom';
import NavItem from './NavItem';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useContext} from 'react';

// Here's the code for a breadcrumb display that shows the new game creation process
const NewGameBreadCrumb = () => {
    const { data, updateData } = useContext(GameDataContext);
    const history = useHistory();

    const handlePlayButtonClicked = () => {

        if (data.galaxyCustomizations.lobbyType == 'multiplayer') {
            // TODO: generate lobby code

            // to="/new_game/lobby/:lobbyToken/game"

            return;
        }

        data.gameStateInterface.startClock();

        // else go to singleplayer game
        history.push('/systems/1');
    };

    const stepOneLabel = () => {
        return data.galaxyCustomizations.lobbyType === 'multiplayer' ? 'Lobby' : 'Players';
    };

    const stepOnePath = () => {
        return data.galaxyCustomizations.lobbyType === 'multiplayer' ? '/new_game/lobbies' : '/new_game';
    };

    return (
        <>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <NavItem text={stepOneLabel()} path={stepOnePath()} altPath="/new_game/lobbies" />
                    <NavItem text="Colonizer Config" path="/new_game/colonizer_config" />
                    <NavItem text="Species Design" path="/new_game/species_design" />
                    <NavItem text="Galaxy Config" path="/new_game/galaxy_config" />
                    <li className="play-button" onClick={handlePlayButtonClicked}>
                        Play
                    </li>
                </ol>
            </nav>
        </>
    );
};

export default NewGameBreadCrumb;
