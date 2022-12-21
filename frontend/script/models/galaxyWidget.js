import { Galaxy } from './galaxy.js';
import { GalaxyDrawer } from './galaxyDrawer.js';

export class GalaxyWidget {

    systemClickHandler;
    mouse;

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

        this.attachDomEventsToCode(this.cx, this.galaxy.systems);
        this.systemNameLabel = document.getElementById("system-name");
        this.galaxyDrawer = new GalaxyDrawer({cx: this.cx, galaxy: this.galaxy, systemNameLabel: this.systemNameLabel, mouse: this.mouse});
    }

    draw() {
        this.galaxyDrawer.drawLoop();
    }

    attachDomEventsToCode(cx, systems) {
        // We can use our function with a canvas event
        this.addMouseMovement(cx)
        this.addMouseClick(cx, systems)
    }

    addMouseMovement(cx) {
        cx.canvas.addEventListener('mousemove', e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        });
    }

    addMouseClick(cx, systems) {
        cx.canvas.addEventListener('click', e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            this.clickHandler(systems);
        });
    }

    clickHandler(systems){
        // check if we're clicking a star system
        systems.forEach( system => {
            if (this.galaxyDrawer.isMouseHovering(system)) {
                const path = "/systems/" + system.id;
                this.systemClickHandler(path);
            }
        });

    }

}
