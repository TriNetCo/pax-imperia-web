import * as THREE from 'three';

export class SpaceViewDomManager {

    constructor(config, clientObjects, systemData) {
        this.c = config;
        this.systems = systemData;
        this.canvas = clientObjects.cx.canvas;
        this.mouse = clientObjects.mouse;
        this.camera = clientObjects.camera;
        this.scene = clientObjects.scene;
        this.selectionSprite = clientObjects.selectionSprite;
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

    populatePlanetList(system) {
        let planetListUl = document.getElementById("planet-list");
        let html = "<h3>Planets:</h3>";
        html += "<ul>";
        let name = system["name"];

        system["planets"].forEach( planet => {
            let index = planet["index"];
            let planetFullName = name + " " + index;

            html += "<li onclick='alert(\"hi\")''>" + planetFullName + "</li>";

        });

        html += "</ul>";
        planetListUl.innerHTML = html;
    }

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

    /* This function recursively walks up the tree of parents until it finds the root scene
        * and removes the highest order group from that scene.
        */
    removeContainerFromScene(container) {
        let parent = container.parent;

        if (parent.type == "Scene") {
            console.log("Deleting object at (" + container.position.x
            + ", " + container.position.y
            + ", " + container.position.z + ")");
            parent.remove(container);
        } else {
            this.removeContainerFromScene(container.parent);
        }
    }

}