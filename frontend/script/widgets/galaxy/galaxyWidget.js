import { GalaxyDrawer } from './galaxyDrawer.js';
import { GalaxyDomManager } from './galaxyDomManager.js';

export class GalaxyWidget {

    galaxyDrawer;
    galaxyDomManager;


    constructor(config, gameData) {
        this.c = config;
        console.log("count: " + config.systemCount);
        this.mouse = { x: 0, y: 0 };
        this.galaxy = gameData.galaxy;
    }

    beginGame(canvas, systemClickHandler) {
        let c = this.c;
        console.log('beginGame systemCount: ' + c.systemCount)

        canvas.width = c.canvasWidth;
        canvas.height = c.canvasHeight;
        let cx = canvas.getContext("2d");

        let systemNameLabel = document.getElementById("system-name");
        this.galaxyDrawer = new GalaxyDrawer({cx: cx, galaxy: this.galaxy, systemNameLabel: systemNameLabel, mouse: this.mouse});
        this.galaxyDomManager = new GalaxyDomManager(cx, this.galaxy.systems, this.galaxyDrawer, systemClickHandler, this.mouse)
        this.galaxyDomManager.attachDomEventsToCode();
    }

    draw() {
        this.galaxyDrawer.drawLoop();
    }

    detachFromDom() {
        this.galaxyDomManager.detachFromDom();
    }

}
