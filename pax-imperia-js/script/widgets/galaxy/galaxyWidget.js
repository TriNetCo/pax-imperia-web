import { GalaxyDrawer } from './galaxyDrawer.js';
import { GalaxyDomManager } from './galaxyDomManager.js';
import { Galaxy } from '../../models/galaxy.js';

export class GalaxyWidget {

    /** @type {GalaxyDrawer} */
    galaxyDrawer;
    /** @type {GalaxyDomManager} */
    galaxyDomManager;
    canvas;
    systemClickHandler;

    constructor(config, galaxy, gameStateInterface) {
        this.c = config;
        this.mouse = { x: 0, y: 0 };
        this.galaxy = galaxy;
        this.gameClock = gameStateInterface.gameClock;
        this.gameStateInterface = gameStateInterface;
        gameStateInterface.galaxyWidget = this;
        window.galaxyWidget = this;

        if (typeof (window) !== 'undefined') {  // These globals break tests hard...
            // TODO: clean this up, it's not needed anymore?
            window.gameClock = window.gameClock ? window.gameClock : this.gameClock;
        }
    }

    loadWidget(canvas, systemClickHandler, overrideConfig) {
        this.canvas = canvas;
        this.systemClickHandler = systemClickHandler;
        let c = this.c;

        canvas.width = overrideConfig.canvasWidth || c.canvasWidth;
        canvas.height = overrideConfig.canvasHeight || c.canvasHeight;
        let cx = canvas.getContext("2d");

        this.galaxyDrawer = new GalaxyDrawer({
            cx: cx,
            galaxy: this.galaxy,
            mouse: this.mouse,
            currentSystemId: overrideConfig.currentSystemId,
            knownConnections: this.gameStateInterface.knownConnections
        });
        this.galaxyDomManager = new GalaxyDomManager(
            cx,
            this.galaxy,
            this.galaxyDrawer,
            systemClickHandler,
            this.mouse)
        this.galaxyDomManager.attachDomEventsToCode();
    }

    exportGalaxyDataToJson() {
        const systemsJson = JSON.stringify(this.galaxy.systems);
        return systemsJson;
    }

    importGalaxyData(systemsJson) {
        let canvas = this.canvas;
        let systemClickHandler = this.systemClickHandler;

        this.galaxy = Galaxy.initializeFromJson(systemsJson);

        if (this.canvas === undefined) return;  // Keep this for a unit testing hack so I wouldn't have to mock the browser's jazz

        let cx = canvas.getContext("2d");
        this.detachFromDom();

        this.galaxyDrawer = new GalaxyDrawer({
            cx: cx,
            galaxy: this.galaxy,
            mouse: this.mouse
        });
        this.galaxyDomManager = new GalaxyDomManager(
            cx,
            this.galaxy,
            this.galaxyDrawer,
            systemClickHandler,
            this.mouse);
        this.galaxyDomManager.attachDomEventsToCode();
    }

    draw() {
        this.galaxyDrawer.drawLoop();
    }

    detachFromDom() {
        this.galaxyDomManager.detachFromDom();
    }

}
