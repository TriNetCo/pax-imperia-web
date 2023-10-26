import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';
import { SpaceViewWidget } from 'pax-imperia-js/script/widgets/space_view/spaceViewWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';
import { Galaxy } from 'pax-imperia-js/script/models/galaxy';
import { GameStateInterface } from 'pax-imperia-js/script/gameStateInterface/gameStateInterface';
import AppConfig from 'src/AppConfig';

const initGameData = () => {
    //////////
    // Main //
    //////////

    Galaxy.seedRandomness('Axd2IJCs;s');

    // add storedPreferences to gameSettings
    const storedPreferences = localStorage.getItem('preferences') || '{}';
    const gameSettings = GameSettings;
    Object.entries(JSON.parse(storedPreferences)).forEach(([key, value]) => {
        gameSettings.galaxyWidget[key] = value;
        gameSettings.spaceViewWidget[key] = value;
    });
    console.log('###storedPreferences', GameSettings.storedPreferences);


    let galaxy =  Galaxy.generateFromConfig(GameSettings.galaxyWidget);
    let websocket = new WebSocket('ws://localhost:3001/websocket');
    let gameStateInterface = new GameStateInterface({galaxy, websocket});

    const data = {
        galaxyWidget:
      new GalaxyWidget(GameSettings.galaxyWidget, galaxy, gameStateInterface),
        spaceViewWidget:
      new SpaceViewWidget(GameSettings.spaceViewWidget, {}, gameStateInterface)
    };

    // Globalize classes for debugging
    window.gameStateInterface = gameStateInterface;
    window.galaxyWidget = data.galaxyWidget;
    window.spaceViewWidget = data.spaceViewWidget;
    window.galaxy = galaxy;
    window.spaceViewAnimator = data.spaceViewWidget.spaceViewAnimator;
    window.cacheMonster = data.spaceViewWidget.cacheMonster;

    window.appConfig = AppConfig;

    gameStateInterface.startClock();
    return data;
};

export { initGameData };
