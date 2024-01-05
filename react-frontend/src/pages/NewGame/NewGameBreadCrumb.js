import { Link } from 'react-router-dom';
import NavItem from './NavItem';

// Here's the code for a breadcrumb display that shows the new game creation process
const NewGameBreadCrumb = () => {

    return (
        <>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <NavItem text="Players" path="/new_game" altPath="/new_game/multiplayer" />
                    <NavItem text="Colonizer Config" path="/new_game/colonizer_config" />
                    <NavItem text="Species Design" path="/new_game/species_design" />
                    <NavItem text="Galaxy Config" path="/new_game/galaxy_config" />
                    <li className="play-button"><Link to="/new_game/lobby/:lobbyToken/game">Play</Link></li>
                </ol>
            </nav>
        </>
    );
};

export default NewGameBreadCrumb;
