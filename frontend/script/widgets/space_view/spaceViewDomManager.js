import * as THREE from 'three';

export class SpaceViewDomManager {

    constructor(cx, systems, spaceViewDrawer, systemClickHandler, mouse, camera, scene, selectionSprite) {
        this.canvas = cx.canvas;
        this.systems = systems;
        this.spaceViewDrawer = spaceViewDrawer;
        this.systemClickHandler = systemClickHandler;
        this.mouse = mouse;
        this.camera = camera;
        this.scene = scene;
        this.selectionSprite = selectionSprite;
        this.raycaster = new THREE.Raycaster();
    }

    attachDomEventsToCode() {
        this.addMouseMovement();
        this.addMouseClick();
    }

    addMouseMovement() {
        this.mouseMovementHandler = ( event ) => {
            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const h = this.canvas.height;
            const w = this.canvas.width;
            this.mouse.x = (event.offsetX / w) * 2 - 1;
            this.mouse.y = -(event.offsetY / h) * 2 + 1;
        }

        this.canvas.addEventListener('mousemove', this.mouseMovementHandler);
    }

    addMouseClick() {
        this.clickHandler = ( event ) => {
            event.preventDefault();
            let raycaster = this.raycaster;
            raycaster.setFromCamera( this.mouse, this.camera );
            const intersects = raycaster.intersectObjects( this.scene.children );

            if ( intersects.length > 0) {

                let uniqueIntersects = intersects.filter( (value, index, self) => {
                    return self.findIndex(v => v.object.id === value.object.id) === index;
                });

                let msg = "HIT: ";
                for ( let i = 0; i < uniqueIntersects.length; i ++ ) {
                    const obj = uniqueIntersects[i].object;
                    msg +=  ", " + obj.name + " (" + obj.id + ")";

                    this.putCursorOverContainer(obj);
                }
                // lowerConsole.print(msg + " {" + this.mouse.x + ", " + this.mouse.y + "}");
            }

        }

        this.canvas.addEventListener('click', this.clickHandler);
    }

    detachFromDom() {
        this.canvas.removeEventListener('mousemove', this.mouseMovementHandler);
        this.canvas.removeEventListener('click', this.clickHandler);
    }


    //////////////////////
    // Drawing Commands //
    //////////////////////

    putCursorOverContainer(container) {
        if (container.name == "selectionSprite") return; // Never put a cursor over the cursor itself
        let parent = container.parent;

        if (parent.type == "Scene") {
            this.selectionSprite.select(container);
            console.log("Selected: " + container.name)
            // lowerConsole.print("Selected: " + container.name);
        } else {
            this.putCursorOverContainer(parent)
        }
    }

}