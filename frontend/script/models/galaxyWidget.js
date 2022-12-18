import { Galaxy } from './galaxy.js';
import { GalaxyDrawer } from './galaxyDrawer.js';

export class GalaxyWidget {

    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    beginGame() {
        let canvas  = this.createCanvas();
        this.container.appendChild(canvas)

        let cx = canvas.getContext("2d");
        let systemNameLabel = document.getElementById("system-name");

        const starCount = 100;
        const galaxy = new Galaxy(canvas.width, canvas.height, starCount);

        GalaxyDrawer.attachDomEventsToCode(cx);
        GalaxyDrawer.drawLoop(cx, galaxy, systemNameLabel);
    }

    createCanvas() {
        var canvas = document.createElement('canvas');

        canvas.id = "galaxy-canvas-large";
        canvas.width = 800;
        canvas.height = 400;
        canvas.style.border = "1px solid";
        return canvas;
    }

}
