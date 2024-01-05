import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useDispatch } from 'react-redux';
import { wsConnect, wsDisconnect } from '../modules/websocket';
import PropTypes from 'prop-types';

export const GameDataContext = React.createContext(null);

const websocketPort = '3001';
export const connectAndJoin = (dispatch) => {
    const host = `ws://127.0.0.1:${websocketPort}/websocket`;

    // This is where we start using the websocket middleware...
    dispatch(wsConnect(host));
};
export const disconnect = (dispatch) => {
    dispatch(wsDisconnect());
};

const GameDataContextProvider = ({children, gameData}) => {
    const dispatch = useDispatch();
    const [data, setData] = useState(gameData);
    const [key, setKey] = useState(0);

    const updateData = (newData) => {
        setData(newData);
        setKey(prevKey => prevKey + 1);
    };

    useEffect( () => {
        connectAndJoin(dispatch);
    }, []);

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
