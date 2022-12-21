export class GalaxyDomAttacher {

    static attachDomEventsToCode(cx, systems, galaxyDrawer, systemClickHandler, mouse) {
        // We can use our function with a canvas event
        addMouseMovement()
        addMouseClick()

        function addMouseMovement() {
            cx.canvas.addEventListener('mousemove', e => {
                mouse.x = e.offsetX;
                mouse.y = e.offsetY;
            });
        }

        function addMouseClick() {
            cx.canvas.addEventListener('click', e => {
                mouse.x = e.offsetX;
                mouse.y = e.offsetY;
                clickHandler(systems);
            });
        }

        function clickHandler(){
            // check if we're clicking a star system
            systems.forEach( system => {
                if (galaxyDrawer.isMouseHovering(system)) {
                    const path = "/systems/" + system.id;
                    systemClickHandler(path);
                }
            });

        }

    }

}