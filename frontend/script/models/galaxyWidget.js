import { Galaxy } from './galaxy.js';
import { GalaxyDrawer } from './galaxyDrawer.js';

export class GalaxyWidget {

    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    beginGame() {
        let canvas  = this.createCanvas();
        this.container.appendChild(canvas)

        this.cx = canvas.getContext("2d");

        const starCount = 100;
        this.galaxy = new Galaxy(canvas.width, canvas.height, starCount);

        GalaxyDrawer.attachDomEventsToCode(this.cx, this.galaxy.systems);
        this.systemNameLabel = document.getElementById("system-name");
    }

    draw() {
        console.log("Drawing");
        GalaxyDrawer.drawLoop(this.cx, this.galaxy, this.systemNameLabel);
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
