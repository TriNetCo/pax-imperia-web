import React, { useEffect } from 'react';
import { bindActionCreators } from "redux";
import { connect, useDispatch } from 'react-redux';
import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';
import { SpaceViewWidget } from 'pax-imperia-js/script/widgets/space_view/spaceViewWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';
import { Galaxy } from 'pax-imperia-js/script/models/galaxy';
import { wsConnect, wsDisconnect } from '../modules/websocket';


//////////
// Main //
//////////

let gameData = {
    galaxy: new Galaxy(GameSettings.galaxyWidget)
};

let systemData = JSON.parse(gameData.galaxy.systems[0].toJson());


const data = {
    galaxyWidget :
        new GalaxyWidget(GameSettings.galaxyWidget, gameData),
    spaceViewWidget:
        new SpaceViewWidget(GameSettings.spaceViewWidget, {}, systemData)
};

export const GameDataContext = React.createContext(data);

const Context = (props) => {
    const dispatch = useDispatch();
    const websocketPort = "3001";

    const connectAndJoin = () => {
        const id = 1;
        // const host = `ws://127.0.0.1:${websocketPort}/ws/game/${id}?token=${localStorage.getItem('token')}`;
        const host = `ws://127.0.0.1:${websocketPort}/websocket`;

        // This is where we start using the websocket middleware...
        dispatch(wsConnect(host));
    };

    useEffect( () => {
        connectAndJoin();
    })

    return (
        <GameDataContext.Provider value={data}>
          {props.children}
        </GameDataContext.Provider>
      );
}


function mapDispatchToProps(dispatch) {
    return {
      actions: {
        wsConnect: bindActionCreators(wsConnect, dispatch),
        wsDisconnect: bindActionCreators(wsDisconnect, dispatch),
      },
    };
}

export default connect(mapDispatchToProps)(Context);
