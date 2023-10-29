import { GalaxyDrawer } from './galaxyDrawer.js';
import { GalaxyDomManager } from './galaxyDomManager.js';
import { Galaxy } from '../../models/galaxy.js';
import { GameStateInterface } from '../../gameStateInterface/gameStateInterface.js';
import * as THREE from 'three';

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
        const oldTime = this.gameStateInterface.gameClock.oldTime;
        return this.galaxy.toJSON(oldTime);
    }

    importGalaxyData(systemsJson) {
        const importData = JSON.parse(systemsJson);

        let canvas = this.canvas;
        let systemClickHandler = this.systemClickHandler;

        this.galaxy.initializeFromJson(importData);

        const deltaC = importData.timeOrigin - performance.timeOrigin;

        // Set the clock
        this.gameStateInterface.gameClock.startTime = importData.gameClock.oldTime + deltaC;
        this.gameStateInterface.gameClock.oldTime = importData.gameClock.oldTime + deltaC;

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
