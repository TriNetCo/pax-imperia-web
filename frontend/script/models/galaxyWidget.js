import { Galaxy } from './galaxy.js';
import { GalaxyDrawer } from './galaxyDrawer.js';

export class GalaxyWidget {

    constructor(canvas) {
        this.canvas = canvas;
    }

    beginGame() {
        if (window.mouse == undefined)
            window.mouse = { x: 0, y: 0 };

        let canvas = this.canvas;

        this.cx = canvas.getContext("2d");

        const starCount = 100;
        this.galaxy = new Galaxy(canvas.width, canvas.height, starCount);

        GalaxyDrawer.attachDomEventsToCode(this.cx, this.galaxy.systems);
        this.systemNameLabel = document.getElementById("system-name");
    }

    draw() {
        GalaxyDrawer.drawLoop(this.cx, this.galaxy, this.systemNameLabel);
    }

}
