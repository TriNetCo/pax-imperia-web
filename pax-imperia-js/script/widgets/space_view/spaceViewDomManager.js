import * as THREE from 'three';

export class SpaceViewDomManager {

    constructor(config, clientObjects, system, systemClickHandler) {
        this.c = config;
        this.system = system;
        this.systemClickHandler = systemClickHandler;
        this.canvas = clientObjects.cx.canvas;
        this.mouse = clientObjects.mouse;
        this.camera = clientObjects.camera;
        this.scene = clientObjects.scene;
        this.selectionSprite = clientObjects.selectionSprite;
        this.raycaster = new THREE.Raycaster();
        this.previousTarget = null;
        this.previousPreviousTarget = null;
    }

    attachDomEventsToCode() {
        this.addMouseMovement();
        this.addMouseClick();
        this.addMouseDoubleClick();
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
        this.canvas.addEventListener('click', this.#clickHandler);
    }

    addMouseDoubleClick() {
        this.canvas.addEventListener('dblclick', this.#doubleClickHandler);
    }

    #clickHandler = ( event ) => {

        // Keep track of target before click
        this.previousPreviousTarget = this.previousTarget;
        this.previousTarget = this.selectionSprite.selectionTarget;
        //if (this.previousTarget && this.previousTarget.name) {
        //    console.log('previousTarget', this.previousTarget.name);
        //}
        //if (this.previousPreviousTarget && this.previousPreviousTarget.name) {
        //    console.log('previousPreviousTarget', this.previousPreviousTarget.name);
        //}

        // Arrow function / lambda so that "this" refers to SpaceViewDomManager
        // instead of canvas
        event.preventDefault();
        let raycaster = this.raycaster;
        raycaster.setFromCamera( this.mouse, this.camera );
        const intersects = raycaster.intersectObjects( this.scene.children );

        // If no intersections, sets target to null
        if (intersects.length == 0) {
            this.selectionSprite.unselect();
        }

        let unselectableNames = ["selectionSprite", "wormholeText"];

        // Loops through intersected objects (sorted by distance)
        for (let i = 0; i < intersects.length; i++) {
            let obj = this.getParentObject(intersects[i].object);
            // Cannot select the selection sprite
            if ( unselectableNames.includes(obj.name) ) {
              continue;
            }
            // If you click again on an object, you can select the
            // object behind
            if (obj != this.selectionSprite.selectionTarget) {
                this.selectionSprite.select(obj);
                break;
            }
        }

        // this.populateSelectTargetText()
        this.populateSidebar()
    }

    #doubleClickHandler = ( event ) => {
        let currentTarget = this.selectionSprite.selectionTarget;
        if (currentTarget && currentTarget.parentEntity.type === "wormhole") {
            let wormholeId = currentTarget.parentEntity.id;
            const path = "/systems/" + wormholeId;
            this.systemClickHandler(path);
        }

        // gets the target before double click
        console.log('double click previousPreviousTarget', this.previousPreviousTarget);

        if (this.previousPreviousTarget && this.previousPreviousTarget.name && this.previousPreviousTarget.name == "ship") {
            this.moveShip(this.previousPreviousTarget)
        }

        // this.populateSelectTargetText()
        this.populateSidebar()
    }

    moveShip(shipTarget) {
        console.log('Moving ship')

        // find intersection between mouseclick and plane of ship
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const shipPlane = new THREE.Plane(new THREE.Vector3( 0, 0, shipTarget.position.z ), -shipTarget.position.z);
        const intersects = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(shipPlane, intersects);
        shipTarget.position.set(intersects.x, intersects.y, intersects.z);

        // set ship as target after moving
        this.selectionSprite.select(shipTarget);
        this.previousTarget = shipTarget;
    }

    getParentObject(obj) {
        // Recursively goes through object to find the highest
        // level object that is not the scene

        let parent = obj.parent;

        if (parent.type == "Scene") {
            return (obj);
        } else {
            return (this.getParentObject(parent));
        }

    }

    detachFromDom() {
        this.canvas.removeEventListener('mousemove', this.mouseMovementHandler);
        this.canvas.removeEventListener('click', this.#clickHandler);
        this.canvas.remove();
    }

    ///////////////////////////////
    // Populate Sidebar Commands //
    ///////////////////////////////

    populateSidebar() {
        this.populateList('star');
        this.populateList('planet');
        this.populateList('ship');
        this.populateList('wormhole');
        if (this.selectionSprite.selectionTarget) {
            window.selectionTarget = this.selectionSprite.selectionTarget
        }
    }

    populateList(entity_type) {
        let listUl = document.getElementById(entity_type + "-list");
        let html = '';
        this.system[entity_type + "s"].forEach( entity => {
            let selectedThumbnail = ""
            let details = ""
            if (this.selectionSprite.selectionTarget &&
                this.selectionSprite.selectionTarget == entity.object3d) {
                    selectedThumbnail = " selected-thumbnail"
                if (entity_type == 'planet') {
                    details = `
                        <br>Mediocre (x2)</br>
                        <br>Pop: 7/8 :)</br>
                        `
                } else {
                    details = "<br>TBD</br>"
                }
            }

            html += `
                <li>
                    <div class="left-menu-thumbnail ${selectedThumbnail}">
                        <img src="${entity.assetThumbnailPath}"></img>
                        <div class="right-side">
                            <div class="star-details">${entity.name}${details}
                            </div>
                        </div>
                    </div>
                </li>
                `;
            });
        listUl.innerHTML = html;
    }


    populatePlanetList() {
        let planetListUl = document.getElementById("planet-list");
        let html = '';

        this.system["planets"].forEach( planet => {
            let planetName = planet.name;
            let selectedThubmnail = ""
            let planetDetails = ""
            if (this.selectionSprite.selectionTarget &&
                this.selectionSprite.selectionTarget == planet.object3d) {
                selectedThubmnail = "selected-thumbnail"
                planetDetails = `
                    <br>Mediocre (x2)</br>
                    <br>Population: 7/8</br>
                    <br>Habitability: :)</br>
                    `
            }

            html += `
                <li>
                    <div class="left-menu-thumbnail ${selectedThubmnail}">
                        <img src="/assets/thumbnails/oxygen_thumbnail.png"></img>
                        <div class="right-side">
                            <div class="planet-details">${planetName}${planetDetails}
                            </div>
                        </div>
                    </div>
                </li>
                `;
        });
        planetListUl.innerHTML = html;
    }

    populateSelectTargetText() {
        let planetListUl = document.getElementById("selected-target");
        let html = "<h3>Selected Target:</h3><ul><li>";

        if (this.selectionSprite.selectionTarget && this.selectionSprite.selectionTarget.name) {
            html += this.selectionSprite.selectionTarget.name
        } else {
            html += "None";
        }

        html += "</li></ul>";
        planetListUl.innerHTML = html;
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
