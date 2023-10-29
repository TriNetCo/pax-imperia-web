import { GalaxyDrawer } from './galaxyDrawer.js';
import { GalaxyDomManager } from './galaxyDomManager.js';
import { Galaxy } from '../../models/galaxy.js';
import { GameStateInterface } from '../../gameStateInterface/gameStateInterface.js';

export class GalaxyWidget {

    /** @type {GalaxyDrawer} */
    galaxyDrawer;
    /** @type {GalaxyDomManager} */
    galaxyDomManager;
    canvas;
    systemClickHandler;

    /**
     *
     * @param {*} config
     * @param {number} config.fps frames per second
     * @param {Galaxy} galaxy
     * @param {GameStateInterface} gameStateInterface
     */
    constructor(config, galaxy, gameStateInterface) {
        this.c = config;
        this.fps = config?.fps || 60;
        this.mouse = { x: 0, y: 0 };
        this.galaxy = galaxy;
        this.gameStateInterface = gameStateInterface;
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
            knownConnections: this.gameStateInterface.knownConnections,
            systemRadius: this.c.systemRadius,
            currentSystemId: overrideConfig.currentSystemId,
            fps: this.fps,
            gameStateInterface: this.gameStateInterface,
        });
        this.galaxyDomManager = new GalaxyDomManager(
            cx,
            this.galaxy,
            this.galaxyDrawer,
            systemClickHandler,
            this.mouse)
        this.galaxyDomManager.attachDomEventsToCode();
    }

    changeSystem(systemIndex) {
        this.galaxyDrawer.setCurrentSystem(systemIndex);
    }

    exportGalaxyDataToJson() {
        const startTime = this.gameStateInterface.gameClock.startTime;
        return this.galaxy.toJSON(startTime);
    }

    importGalaxyData(systemsJson) {
        let canvas = this.canvas;
        let systemClickHandler = this.systemClickHandler;

        // We need to re-use the existing galaxy object so that changes are
        // reflected automatically by anything holding a reference to that galaxy
        // (e.g. the space view widget)
        this.galaxy.initializeFromJson(systemsJson);

        this.gameStateInterface.gameClock.startTime = this.galaxy.startTime;

        if (this.canvas === undefined) return;  // Keep this for a unit testing hack so I wouldn't have to mock the browser's jazz

        let cx = canvas.getContext("2d");
        this.detachFromDom();

        this.galaxyDrawer = new GalaxyDrawer({
            cx: cx,
            galaxy: this.galaxy,
            mouse: this.mouse,
            knownConnections: this.gameStateInterface.knownConnections,
            systemRadius: this.c.systemRadius,
            currentSystemId: undefined,
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
