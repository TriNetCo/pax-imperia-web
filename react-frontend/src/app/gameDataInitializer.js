import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';
import { SpaceViewWidget } from 'pax-imperia-js/script/widgets/space_view/spaceViewWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';
import { Galaxy } from 'pax-imperia-js/script/models/galaxy';
import { GameStateInterface } from 'pax-imperia-js/script/gameStateInterface/gameStateInterface';

const initGameData = () => {
    //////////
    // Main //
    //////////

    let galaxy =  Galaxy.generateFromConfig(GameSettings.galaxyWidget);
    let websocket = new WebSocket('ws://localhost:3001/websocket');
    let gameStateInterface = new GameStateInterface({galaxy, websocket});

    const data = {
        galaxyWidget:
      new GalaxyWidget(GameSettings.galaxyWidget, galaxy, gameStateInterface),
        spaceViewWidget:
      new SpaceViewWidget(GameSettings.spaceViewWidget, {}, galaxy)
    };

    gameStateInterface.startClock();
    return data;
};

export { initGameData };
