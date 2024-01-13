import React, {useEffect, useState, useContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {selectWebsocket, connectAndJoin} from '../modules/websocket';
import PropTypes from 'prop-types';
import UserContext from './UserContext';


/**
 * @typedef {object} GameDataContextProviderProps
 * @property {GameData} gameData
 * @property {function} updateData
 */
/**
 * @type {React.Context<GameDataContextProviderProps>}
 */
export const GameDataContext = React.createContext(null);


/**
 * @param {object} props
 * @param {React.Element} props.children
 * @param {GameData} props.gameData
 * @return {React.Element}
 */
const GameDataContextProvider = ({children, gameData}) => {
    const dispatch = useDispatch();
    const websocket = useSelector(selectWebsocket);
    const userContext = useContext(UserContext);
    const [key, setKey] = useState(0);

    const updateData = () => {
        setKey(prevKey => prevKey + 1);
    };

    useEffect( () => {
        connectAndJoin(dispatch, userContext);
    }, []);

    gameData.injectReactGarbage({dispatch, userContext, websocket, updateData});

    return (
        <GameDataContext.Provider value={{gameData: gameData, updateData, key}}>
            {children}
        </GameDataContext.Provider>
    );
};

GameDataContextProvider.propTypes = {
    children: PropTypes.element.isRequired,
    gameData: PropTypes.object,
};

export default GameDataContextProvider;
