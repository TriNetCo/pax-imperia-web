export class GalaxyDomManager {

    constructor(cx, galaxy, galaxyDrawer, systemClickHandler, mouse) {
        this.canvas = cx.canvas;
        this.galaxy = galaxy;
        this.galaxyDrawer = galaxyDrawer;
        this.systemClickHandler = systemClickHandler;
        this.mouse = mouse;
    }

    attachDomEventsToCode() {
        this.addMouseMovement()
        this.addMouseClick()
    }

    addMouseMovement() {
        this.mouseMovementHandler = e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        };

        this.canvas.addEventListener('mousemove', this.mouseMovementHandler);
    }

    addMouseClick() {
        this.clickHandler = (event) => {
            this.mouse.x = event.offsetX;
            this.mouse.y = event.offsetY;

            // check if we're clicking a star system
            this.galaxy.systems.forEach(system => {
                if (this.galaxyDrawer.isMouseHovering(system)) {
                    const path = "/systems/" + system.id;
                    this.systemClickHandler(path);
                }
            });
        };

        this.canvas.addEventListener('click', this.clickHandler);
    }

    detachFromDom() {
        this.canvas.removeEventListener('mousemove', this.mouseMovementHandler);
        this.canvas.removeEventListener('click', this.clickHandler);
    }

}
