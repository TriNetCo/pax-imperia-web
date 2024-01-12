import { useHistory } from 'react-router-dom';
import { GameDataContext } from 'src/app/GameDataContextProvider';
import {useContext, useState} from 'react';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            light: '#5A6D8D',
            main: '#5e6d8b',
            dark: '#b26a00',
            contrastText: '#fff',
        },
    },
}); // #ffc400

// header bg:  #232a39
// border: #5e6d8b

// eslint-disable-next-line react/prop-types
const NiceButton = ({path, callback, label, children}) => {
    const history = useHistory();

    const handleClick = () => {
        if (callback) {
            callback();
        }
        history.push(path);
    };

    return (
        <div>
            <Button theme={theme} variant="contained" onClick={handleClick}>
                {label}
            </Button>
            {children}
        </div>
    );
};


const SessionChoiceTab = () => {
    const { data } = useContext(GameDataContext);
    const [isPrivate, setIsPrivate] = useState(false);

    const handlePrivateChange = (event) => {
        data.gameCustomizations.isPrivate = event.target.checked;
        setIsPrivate(event.target.checked);
    };

    // TODO: move to useEffect on singleplayer page
    const createSingleplayerLobby = () => {
        data.initNewGame();
        data.gameCustomizations.lobbyType = 'singleplayer';
    };

    return (
        <div className="players-menu-flex">
            <div className="players-menu-item left"></div>
            <div className="players-menu-item middle">
                <NiceButton
                    label="Singleplayer"
                    path="/new_game/colonizer_config"
                    callback={ createSingleplayerLobby }>
                </NiceButton>

                <NiceButton
                    label="Host Multiplayer"
                    path="/new_game/lobbies" >
                    <span style={{ 'marginLeft': '20px', 'color': '#232a39' }}>
                        Private?
                    </span>
                    <Checkbox
                        checked={isPrivate}
                        onClick={handlePrivateChange}
                        theme={theme}
                    />
                </NiceButton>

                <NiceButton
                    label="Join Multiplayer"
                    path="/lobbies">
                </NiceButton>
            </div>
            <div className="players-menu-item right"></div>
        </div>
    );
};

export default SessionChoiceTab;
