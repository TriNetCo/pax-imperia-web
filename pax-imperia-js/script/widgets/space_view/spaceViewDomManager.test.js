import {GameSettings} from '../../gameSettings';
import { GameStateInterface } from '../../gameStateInterface/gameStateInterface';
import {Galaxy} from '../../models/galaxy';
import { SelectionSprite } from '../../models/selectionSprite';
import { SpaceViewWidget } from './spaceViewWidget';

Galaxy.seedRandomness('Axc2IJCs;s');
const galaxyWidgetConfig = GameSettings.galaxyWidget;
const spaceViewWidgetConfig = GameSettings.spaceViewWidget;
const clientObjects = {
    mouse: { x: 0, y: 0 },
    gameClock: { running: false, start: () => { } },
    cx: {
        canvas: {},
    },
    selectionSprite: new SelectionSprite(),
}

const websocket = {
    send: () => { },
    onmessage: () => { }
};


test('Given I just entered a system, when I double click a wormhole, then I navigate to the next system', () => {

    /////////////
    //  Given  //
    /////////////

    const galaxy = Galaxy.generateFromConfig(galaxyWidgetConfig);

    const gameStateInterface = new GameStateInterface({galaxy, websocket});

    const system = galaxy.systems[0];
    const wormhole = system.wormholes[0];
    wormhole.object3d = { parentEntity: wormhole };

    const renderer = {};
    const spaceViewWidget = new SpaceViewWidget(spaceViewWidgetConfig, clientObjects, gameStateInterface, renderer);
    spaceViewWidget.setupRenderer = () => { };
    spaceViewWidget.resetThreeObjects = () => { };

    let urlPath = null;
    spaceViewWidget.loadWidget(system.id, (path) => { urlPath = path; });
    spaceViewWidget.spaceViewDomManager.populateHtml = () => { };

    /////////////
    //  When   //
    /////////////

    // performing an initial click on a wormhole will have this effect
    spaceViewWidget.spaceViewDomManager.handleSelectionChange(wormhole.object3d);

    // The second consecutive click will do the following
    spaceViewWidget.spaceViewDomManager.doubleClickHandler({});

    /////////////
    //  Then   //
    /////////////

    // We can't test beyond this spy because that would be testing things
    // that react is doing, like galaxyWidget calls.
    expect(urlPath).toBe("/systems/" + wormhole.toId);

});
