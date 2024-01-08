import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';
import { SpaceViewWidget } from 'pax-imperia-js/script/widgets/space_view/spaceViewWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';
import { Galaxy } from 'pax-imperia-js/script/models/galaxy';
import { GameStateInterface } from 'pax-imperia-js/script/gameStateInterface/gameStateInterface';
import AppConfig from 'src/AppConfig';
import Lobby from './Lobby';

export default class GameData {

    websocket;

    /** @type {Lobby} */
    lobby;

    // /** @type {Galaxy} */
    galaxy;

    // /** @type {GameStateInterface} */
    gameStateInterface;

    // /** @type {GalaxyWidget} */
    galaxyWidget;

    // /** @type {SpaceViewWidget} */
    spaceViewWidget;

    galaxyCustomizations = {};

    seed;

    constructor(lobby) {
        this.lobby = lobby ? lobby : new Lobby();

        this.configureSeed();

        this.continueExistingGame();

        // add storedPreferences to gameSettings
        const gameSettings = this.loadUserPreferences();
    }

    initNewGame() {
        const galaxy =  Galaxy.generateFromConfig(GameSettings.galaxyWidget);
        const gameStateInterface = new GameStateInterface({galaxy});

        const galaxyWidget = new GalaxyWidget(GameSettings.galaxyWidget, galaxy, gameStateInterface);
        const spaceViewWidget = new SpaceViewWidget(GameSettings.spaceViewWidget, {}, gameStateInterface);

        [this.galaxy, this.gameStateInterface, this.galaxyWidget, this.spaceViewWidget] =
            [ galaxy,      gameStateInterface,      galaxyWidget,      spaceViewWidget];

        this.globalizeClasses();
    }

    injectReactGarbage(garbage) {
        this.dispatch = garbage.dispatch;
        this.lobby.dispatch = garbage.dispatch;
        this.lobby.websocket = garbage.websocket;
        this.lobby.userContext = garbage.userContext;
    }

    // Globalize classes for debugging
    globalizeClasses() {
        window.gameStateInterface = this.gameStateInterface;
        window.galaxyWidget = this.galaxyWidget;
        window.spaceViewWidget = this.spaceViewWidget;
        window.galaxy = this.galaxy;
        window.spaceViewAnimator = this.spaceViewWidget.spaceViewAnimator;
        window.cacheMonster = this.spaceViewWidget.cacheMonster;

        window.appConfig = AppConfig;
    }

    configureSeed() {
        // Check for seed in local storage
        let seed = localStorage.getItem('gameSeed');

        if (seed === null) {
            // choose a random seed which is a string of 10 characters, e.g. 'Axd2IJCs;s'
            seed = Math.random().toString(36).substring(2, 12);
            // seed = 'Axc2IJCs;s';
        }

        Galaxy.seedRandomness(seed);

        this.seed = seed;
    }

    // TODO: Load saved game state...
    // Requires:
    //   - [x] serialization of game state...
    //   - [ ] A save button that invokes the serialization and puts it into local storage
    //   - [ ] A Continue Playing Button on dashboard
    //   - [ ] A Single player button that leads to New Game and Load Game buttons
    continueExistingGame() {
        // If the player has refreshed the page or re-opened their browser,
        // we should be able to just resume their game

    }

    loadUserPreferences() {
        const gameSettings = GameSettings;
        const storedPreferences = localStorage.getItem('preferences') || '{}';
        Object.entries(JSON.parse(storedPreferences)).forEach(([key, value]) => {
            gameSettings.galaxyWidget[key] = value;
            gameSettings.spaceViewWidget[key] = value;
        });
        console.log('###storedPreferences', storedPreferences);
        return gameSettings;
    }

}
