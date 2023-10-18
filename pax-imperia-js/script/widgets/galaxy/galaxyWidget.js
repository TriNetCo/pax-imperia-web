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
            currentSystemId: overrideConfig.currentSystemId,
            knownConnections: this.gameStateInterface.knownConnections,
            systemRadius: this.c.systemRadius,
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
        return this.galaxy.toJson();
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
