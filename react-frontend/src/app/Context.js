import React, { createContext, useState, ReactElement } from 'react';

import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';
import { Galaxy } from 'pax-imperia-js/script/models/galaxy';


//////////
// Main //
//////////

let gameData = {
    galaxy: new Galaxy(GameSettings.galaxyWidget)
};

const data = {
    galaxyWidget :
        new GalaxyWidget(GameSettings.galaxyWidget, gameData)
};

export const GameDataContext = React.createContext(data);

export default (props) => {

    return (
        <GameDataContext.Provider value={data}>
          {props.children}
        </GameDataContext.Provider>
      );
}

