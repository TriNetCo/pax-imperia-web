import React, {useEffect, useState, useContext} from 'react';
import { bindActionCreators } from 'redux';
import {connect, useDispatch, useSelector} from 'react-redux';
import {wsConnect, wsDisconnect, selectWebsocket} from '../modules/websocket';
import PropTypes from 'prop-types';
import UserContext from './UserContext';


/**
 * @typedef {object} GameDataContextProviderProps
 * @property {GameData} data
 * @property {function} updateData
 */
/**
 * @type {React.Context<GameDataContextProviderProps>}
 */
export const GameDataContext = React.createContext(null);

export const connectAndJoin = (dispatch, userContext) => {
    const websocketPort = '3001';
    const host = `ws://127.0.0.1:${websocketPort}/websocket`;

    // This is where we start using the websocket middleware...
    let authData = {
        email: userContext.email,
        displayName: userContext.displayName,
        token: userContext.token,
    };

    if (!authData.displayName) {
        authData = {
            email: 'anonymous@example.com',
            displayName: 'anonymous',
            token: 'anonymous',
        };
    }

    dispatch(wsConnect(host, authData));
};

// This is unused but some pattern around load balancing may leverage this
export const disconnect = (dispatch) => {
    dispatch(wsDisconnect());
};


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
    const [data, setData] = useState(gameData);
    const [key, setKey] = useState(0);

    const updateData = () => {
        setKey(prevKey => prevKey + 1);
    };

    useEffect( () => {
        connectAndJoin(dispatch, userContext);
    }, []);

    gameData.injectReactGarbage({dispatch, userContext, websocket, updateData});

    return (
        <GameDataContext.Provider value={{data, updateData, key}}>
            {children}
        </GameDataContext.Provider>
    );
};

GameDataContextProvider.propTypes = {
    children: PropTypes.element.isRequired,
    gameData: PropTypes.object,
};

export default GameDataContextProvider;
