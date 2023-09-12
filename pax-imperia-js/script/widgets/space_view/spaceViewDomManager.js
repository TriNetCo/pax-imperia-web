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

        window.clickThumbnail = (targetType, targetName) => {
            const entity = this.system[targetType + 's'].find(x => x.name === targetName);
            this.selectTarget(entity.object3d);
            this.populateSidebar();
        };

        window.handleTargetButton = (buttonState) => {
            this.selectionSprite.selectionTarget.parentEntity.buttonState = buttonState;
            // let user know which button is selected
            document.getElementById(buttonState).style.background='#A9A9A9'; // default color ButtonFace
        };

    }

    ///////////////////////
    // Attach Dom Events //
    ///////////////////////

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
        const selectionTarget = this.findSelectionTarget(event);
        this.selectTarget(selectionTarget);
        this.populateSidebar();
    }

    #doubleClickHandler = ( event ) => {
        // check if the target before double click was a ship
        if (this.previousPreviousTarget &&
            this.previousPreviousTarget.parentEntity &&
            this.previousPreviousTarget.parentEntity.type == "ship") {
            this.moveShip(this.previousPreviousTarget, this.previousTarget, 'default');
            this.previousTarget = this.previousPreviousTarget;
        } else {
            // doesn't enter the wormhole if a ship was being moved
            if (this.previousTarget && this.previousTarget.parentEntity.type === "wormhole") {
                let wormholeId = this.previousTarget.parentEntity.id;
                const path = "/systems/" + wormholeId;
                this.systemClickHandler(path);
            }

        }
        this.populateSidebar();
    }

    ///////////////////
    // Click Helpers //
    ///////////////////

    selectTarget(object3d) {
        // Keep track of target before new selection
        this.previousPreviousTarget = this.previousTarget;
        this.previousTarget = this.selectionSprite.selectionTarget;

        // Select new target
        if (object3d) {
            this.selectionSprite.select(object3d);
        } else {
            this.selectionSprite.unselect();
        }

        if (this.previousTarget &&
            this.previousTarget.parentEntity.type == "ship" &&
            this.previousTarget.parentEntity.buttonState) {
                this.moveShip(this.previousTarget, this.selectionSprite.selectionTarget, this.previousTarget.parentEntity.buttonState);
                // clear button state
                this.previousTarget.parentEntity.buttonState = null;
        }
    }

    findSelectionTarget(event) {
        // cannot click on these types of objects
        const unselectableNames = ["selectionSprite", "wormholeText"];

        event.preventDefault();
        let raycaster = this.raycaster;
        raycaster.setFromCamera( this.mouse, this.camera );
        const intersects = raycaster.intersectObjects( this.scene.children );

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
                //this.selectionSprite.select(obj);
                return obj;
            }
        }
        return null;
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

    moveShip(ship3d, target=null, mode='default') {
        // ship3d is the 3d object and shipEntity is the JS object
        const shipEntity = ship3d.parentEntity;
        // clear all movement
        shipEntity.resetMovement();

        if (mode == 'colonize' &&
            target &&
            target.parentEntity.type != 'planet') {
                alert("Only planets can be colonized");
                return;
        }

        // set targets based on movement mode
        // default behavior moves to target and orbits
        if (['default', 'move', 'orbit', 'colonize'].includes(mode) && target) {
            shipEntity.destinationTarget = target;
        }
        if (['default', 'orbit'].includes(mode) && target) {
            shipEntity.orbitTarget = target;
        }
        if (mode == 'colonize' && target) {
            shipEntity.colonizeTarget = target;
        }
        if (['default', 'move'].includes(mode) && !target) {
            this.setShipDestinationPoint(ship3d, shipEntity);
        }

        // re-set ship as target after moving
        this.selectionSprite.select(ship3d);
    }

    setShipDestinationPoint(ship3d, shipEntity) {
        // find intersection between mouse click and plane of ship
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const shipPlane = new THREE.Plane(new THREE.Vector3( 0, 0, ship3d.position.z ), -ship3d.position.z);
        const intersects = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(shipPlane, intersects);
        shipEntity.destinationPoint = {x: intersects.x, y: intersects.y, z: intersects.z};
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
        this.populateButtons();
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
                } else if (entity_type == 'ship') {
                    details = `<br>${entity.status}</br>`
                } else {
                    details = "<br>TBD</br>"
                }
            }

            html += `
                <li>
                    <div class="left-menu-thumbnail ${selectedThumbnail}" onclick="clickThumbnail('${entity.type}', '${entity.name}')">
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

    populateButtons() {
        let buttonsUI = document.getElementById("buttons");
        let html = "";
        if (this.selectionSprite.selectionTarget) {
            html = this.selectionSprite.selectionTarget.parentEntity.buttons;
        }
        buttonsUI.innerHTML = html;
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

    targetDebugging() {
        // debugging
        let consoleLogName = 'none';
        if (this.previousPreviousTarget && this.previousPreviousTarget.parentEntity) {
            consoleLogName = this.previousPreviousTarget.parentEntity.name;
        }
        console.log('previousPreviousTarget', consoleLogName);
        consoleLogName = 'none';
        if (this.previousTarget && this.previousTarget.parentEntity) {
            consoleLogName = this.previousTarget.parentEntity.name;
        }
        console.log('previousTarget', consoleLogName);

        consoleLogName = 'none';
        if (this.selectionSprite.selectionTarget && this.selectionSprite.selectionTarget.parentEntity) {
            consoleLogName = this.selectionSprite.selectionTarget.parentEntity.name;
        }
        console.log('selectionTarget', consoleLogName);

        // expose selectionTarget to dev console
        if (this.selectionSprite.selectionTarget) {
            window.selectionTarget = this.selectionSprite.selectionTarget;
        }

        if (this.previousTarget &&
            this.previousTarget.parentEntity.buttonState ) {
            console.log("previousTarget buttonState", this.previousTarget.parentEntity.buttonState)
        }
    }

}
