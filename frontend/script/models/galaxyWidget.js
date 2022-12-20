import { Galaxy } from './galaxy.js';
import { GalaxyDrawer } from './galaxyDrawer.js';

export class GalaxyWidget {

    systemClickHandler;

    constructor(gameSettings) {
        this.width = gameSettings.canvasWidth;
        this.height = gameSettings.canvasHeight;
        this.systemCount = gameSettings.systemCount;
        console.log("count: " + gameSettings.systemCount);
        this.galaxy = new Galaxy(gameSettings);
    }

    beginGame(canvas, systemClickHandler) {
        this.canvas = canvas;
        this.systemClickHandler = systemClickHandler;
        canvas.width = this.width;
        canvas.height = this.height;
        // TODO: Refactor so window.mouse exists on... GalaxyWidget???
        if (window.mouse == undefined)  // Here's where the widget store mouse location information when MouseMove events fire
            window.mouse = { x: 0, y: 0 };

        this.cx = canvas.getContext("2d");
        console.log('beginGame systemCount: ' + this.systemCount)

        this.attachDomEventsToCode(this.cx, this.galaxy.systems);
        this.systemNameLabel = document.getElementById("system-name");
    }

    draw() {
        GalaxyDrawer.drawLoop(this.cx, this.galaxy, this.systemNameLabel);
    }

    attachDomEventsToCode(cx, systems) {
        // We can use our function with a canvas event
        this.addMouseMovement(cx)
        this.addMouseClick(cx, systems)
    }

    addMouseMovement(cx) {
        cx.canvas.addEventListener('mousemove', e => {
            window.mouse =  { x: e.offsetX, y: e.offsetY };
        });
    }

    addMouseClick(cx, systems) {
        cx.canvas.addEventListener('click', event => {
            window.mouse = { x: event.offsetX, y: event.offsetY };
            this.clickHandler(systems);
        });
    }

    clickHandler(systems){
        // check if we're clicking a star system
        systems.forEach( system => {
            if (GalaxyDrawer.isMouseHovering(system)) {
                const path = "/systems/" + system.id;
                this.systemClickHandler(path);
            }
        });

    }

}
