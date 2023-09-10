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
        this.currentTarget = null;
        this.previousTarget = null;
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
        this.previousTarget = this.currentTarget;
        this.currentTarget = this.selectionSprite.selectionTarget;

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

        // expose selectionTarget to dev console
        if (this.selectionSprite.selectionTarget) {
            window.selectionTarget = this.selectionSprite.selectionTarget
        }
    }

    #doubleClickHandler = ( event ) => {
        // check if the target before double click was a ship
        if (this.previousTarget &&
            this.previousTarget.parentEntity &&
            this.previousTarget.parentEntity.type == "ship") {
            this.moveShip(this.previousTarget, this.currentTarget);
        } else {
            // doesn't enter the wormhole if a ship was being moved
            if (this.currentTarget && this.currentTarget.parentEntity.type === "wormhole") {
                let wormholeId = this.currentTarget.parentEntity.id;
                const path = "/systems/" + wormholeId;
                this.systemClickHandler(path);
            }

        }

        // this.populateSelectTargetText()
        this.populateSidebar();
    }

    moveShip(ship3d, currentTarget) {
        console.log('Moving ship');
        // ship3d is the 3d object and shipEntity is the JS object
        const shipEntity = ship3d.parentEntity;
        // save target info when an object was selected for ship to move toward
        shipEntity.destinationTarget = currentTarget;

        // find intersection between mouseclick and plane of ship
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const shipPlane = new THREE.Plane(new THREE.Vector3( 0, 0, ship3d.position.z ), -ship3d.position.z);
        const intersects = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(shipPlane, intersects);
        shipEntity.destinationPoint = {x: intersects.x, y: intersects.y, z: intersects.z}

        // re-set ship as target after moving
        this.selectionSprite.select(ship3d);
        this.currentTarget = ship3d;
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
