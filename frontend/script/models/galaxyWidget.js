import { Galaxy } from './galaxy.js';
import { GalaxyDrawer } from './galaxyDrawer.js';
import { GalaxyDomManager } from './galaxyDomManager.js';

export class GalaxyWidget {

    systemClickHandler;

    constructor(gameSettings) {
        this.width = gameSettings.canvasWidth;
        this.height = gameSettings.canvasHeight;
        this.systemCount = gameSettings.systemCount;
        console.log("count: " + gameSettings.systemCount);
        this.mouse = { x: 0, y: 0 };
        this.galaxy = new Galaxy(gameSettings);
    }

    beginGame(canvas, systemClickHandler) {
        this.canvas = canvas;
        this.systemClickHandler = systemClickHandler;
        canvas.width = this.width;
        canvas.height = this.height;

        this.cx = canvas.getContext("2d");
        console.log('beginGame systemCount: ' + this.systemCount)

        this.systemNameLabel = document.getElementById("system-name");
        this.galaxyDrawer = new GalaxyDrawer({cx: this.cx, galaxy: this.galaxy, systemNameLabel: this.systemNameLabel, mouse: this.mouse});
        this.galaxyDomManager = new GalaxyDomManager(this.cx, this.galaxy.systems, this.galaxyDrawer, this.systemClickHandler, this.mouse)
        this.attachDomEventsToCode();
    }

    draw() {
        this.galaxyDrawer.drawLoop();
    }

    attachDomEventsToCode() {
        this.galaxyDomManager.attachDomEventsToCode();
    }

    detachFromDom() {
        this.galaxyDomManager.detachFromDom();
    }

}
