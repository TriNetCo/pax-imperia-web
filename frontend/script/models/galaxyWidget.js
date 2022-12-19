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
                alert('clicked system ' + system.id + ' ' + system.name);

                window.location.href = "systems/" + 1 + ".html";
            }
        });

    }


}
