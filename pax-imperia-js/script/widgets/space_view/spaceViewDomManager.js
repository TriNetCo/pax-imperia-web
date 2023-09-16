import * as THREE from 'three';
import { Queue } from '../../models/helpers.js';

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
        this.previousTargets = new Queue(3);

        window.clickThumbnail = (targetType, targetName) => {
            const entity = this.system[targetType + 's'].find(x => x.name === targetName);
            this.selectTarget(entity.object3d);
            this.populateHtml();
        };

        window.handleTargetButton = (buttonState) => {
            this.selectionSprite.selectionTarget.parentEntity.buttonState = buttonState;
            // let user know which button is selected
            document.getElementById(buttonState).style.background='#A9A9A9'; // default color ButtonFace
        };

    }

    ////////////////////
    // Click Handlers //
    ////////////////////

    #clickHandler = ( event ) => {
        const selectionTarget = this.findSelectionTarget(event);
        this.selectTarget(selectionTarget);
        this.populateHtml();
    }

    #doubleClickHandler = ( event ) => {
        // on a doubleclick, previousTargets queue will look like:
        //     0: double-clicked object or object behind,
        //     1: double-clicked object,
        //     2: object before double-click
        // so it is safest to use previousTargets[1] as double-click target
        const clickTarget = this.previousTargets[1]
        // check if the target before double click was a ship
        if (this.previousTargets[2] &&
            this.previousTargets[2].parentEntity &&
            this.previousTargets[2].parentEntity.type == "ship") {
                this.moveShip(this.previousTargets[2], clickTarget, 'default');
        } else {
            // navigate through wormhole (unless ship was just moved through wormhole)
            if (clickTarget &&
                clickTarget.parentEntity.type === "wormhole") {
                    const wormholeId = clickTarget.parentEntity.id;
                    const path = "/systems/" + wormholeId;
                    this.systemClickHandler(path);
            }
        }
        this.populateHtml();
    }

    ///////////////////////////
    // Click Handler Helpers //
    ///////////////////////////

    selectTarget(object3d) {
        // select new target
        if (object3d) {
            this.selectionSprite.select(object3d);
        } else {
            this.selectionSprite.unselect();
        }
        // add latest target to queue
        this.previousTargets.push(this.selectionSprite.selectionTarget);

        if (this.previousTargets[1] &&
            this.previousTargets[1].parentEntity.type == "ship" &&
            this.previousTargets[1].parentEntity.buttonState) {
                const buttonState = this.previousTargets[1].parentEntity.buttonState
                this.moveShip(this.previousTargets[1], this.previousTargets[0], buttonState);
        }
    }

    findSelectionTarget(event) {
        // cannot click on these types of objects
        const unselectableNames = ["selectionSprite", "wormholeText"];

        event.preventDefault();
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        let selection = null;
        // Loops through intersected objects (sorted by distance)
        for (let i = 0; i < intersects.length; i++) {
            let obj = this.getParentObject(intersects[i].object);
            if (unselectableNames.includes(obj.name)) {
                continue;
            }
            // If current selectionTarget clicked again, remember it
            // but look for an object behind to select instead
            if (obj == this.selectionSprite.selectionTarget) {
                selection = obj;
            } else {
                // Returns a selection different from current selectionTarget
                selection = obj
                return selection;
            }
        }
        // Returns null unless the current selectionTarget was selected again
        return selection;
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
        this.selectTarget(ship3d);
        // clear ship button state
        shipEntity.buttonState = null;
    }

    setShipDestinationPoint(ship3d, shipEntity) {
        // find intersection between mouse click and plane of ship
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const shipPlane = new THREE.Plane(new THREE.Vector3( 0, 0, ship3d.position.z ), -ship3d.position.z);
        const intersects = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(shipPlane, intersects);
        shipEntity.destinationPoint = {x: intersects.x, y: intersects.y, z: intersects.z};
    }

    ///////////////////////////////
    // Populate Sidebar Commands //
    ///////////////////////////////

    populateHtml() {
        // sidebar lists
        this.populateList('star');
        this.populateList('planet');
        this.populateList('ship');
        this.populateList('wormhole');

        // lower console
        this.populateConsoleBody();
    }

    populateList(entity_type) {
        let listUl = document.getElementById(entity_type + "-list");
        let html = '';
        this.system[entity_type + "s"].forEach( entity => {
            let selectedThumbnail = ""
            let details = ""
            if (this.selectionSprite.selectionTarget &&
                this.selectionSprite.selectionTarget == entity.object3d) {
                    selectedThumbnail = " selected-thumbnail";
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

    populateConsoleBody() {
        let html = "";
        if (this.selectionSprite.selectionTarget) {
            html = this.selectionSprite.selectionTarget.parentEntity.returnConsoleHtml();
        }
        document.getElementById("lower-console").innerHTML = html;
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

    detachFromDom() {
        this.canvas.removeEventListener('mousemove', this.mouseMovementHandler);
        this.canvas.removeEventListener('click', this.#clickHandler);
        this.canvas.remove();
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
