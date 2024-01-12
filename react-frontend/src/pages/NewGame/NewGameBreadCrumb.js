import {Link, useHistory} from 'react-router-dom';
import NavItem from './NavItem';
import {GameDataContext} from 'src/app/GameDataContextProvider';
import {useContext} from 'react';
import GoButton from './GoButton';

// Here's the code for a breadcrumb display that shows the new game creation process
const NewGameBreadCrumb = () => {
    const { data } = useContext(GameDataContext);

    const stepOneLabel = () => {
        return data.gameCustomizations.lobbyType === 'multiplayer' ? 'Lobby' : 'Players';
    };

    const stepOnePath = () => {
        return data.gameCustomizations.lobbyType === 'multiplayer' ? '/new_game/lobbies' : '/new_game';
    };

    return (
        <>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <NavItem text={stepOneLabel()} path={stepOnePath()} altPath="/new_game/lobbies" />
                    <NavItem text="Colonizer Config" path="/new_game/colonizer_config" />
                    <NavItem text="Species Design" path="/new_game/species_design" />
                    <NavItem text="Galaxy Config" path="/new_game/galaxy_config" />

                    <GoButton />

                </ol>
            </nav>
        </>
    );
};

export default NewGameBreadCrumb;
