import React, {useEffect, useState, useContext} from 'react';
import { bindActionCreators } from 'redux';
import {connect, useDispatch, useSelector} from 'react-redux';
import {wsConnect, wsDisconnect, selectWebsocket} from '../modules/websocket';
import PropTypes from 'prop-types';
import UserContext from './UserContext';

export const GameDataContext = React.createContext(null);

export const connectAndJoin = (dispatch) => {
    const websocketPort = '3001';
    const host = `ws://127.0.0.1:${websocketPort}/websocket`;

    // This is where we start using the websocket middleware...
    dispatch(wsConnect(host));
};

// This is unused but some pattern around load balancing may leverage this
export const disconnect = (dispatch) => {
    dispatch(wsDisconnect());
};

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
        connectAndJoin(dispatch);
    }, []);

    gameData.injectReactGarbage({dispatch, userContext, websocket});

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

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            wsConnect: bindActionCreators(wsConnect, dispatch),
            wsDisconnect: bindActionCreators(wsDisconnect, dispatch),
        },
    };
}

export default connect(mapDispatchToProps)(GameDataContextProvider);
