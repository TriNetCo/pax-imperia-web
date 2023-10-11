import * as THREE from 'three';
import { Queue } from '../../models/helpers.js';
import { SpriteFlipbook } from '../../models/spriteFlipbook.js';
import Entity from './entities/entity.js';

/**
 * This class handles interactions with the dom
 */
export class SpaceViewDomManager {

    /**
     *
     * @param {*} config
     * @param {Object} clientObjects
     * @param {SpriteFlipbook} clientObjects.selectionSprite - This is just a sprite that is used to show the selection
     * @param {*} system
     * @param {*} systemClickHandler
     */
    constructor(config, clientObjects, system, systemClickHandler) {
        this.c = config;
        this.system = system;
        this.systemClickHandler = systemClickHandler;
        this.canvas = clientObjects.cx.canvas;
        this.mouse = clientObjects.mouse;
        this.camera = clientObjects.camera;
        this.scene = clientObjects.scene;
        this.renderer = clientObjects.renderer;
        this.selectionSprite = clientObjects.selectionSprite;
        this.raycaster = new THREE.Raycaster();
        this.previousTarget = null;
        this.previousPreviousTarget = null;
        this.previousTargets = new Queue(3);
        this.eventLogHtml = '';
        window.SpaceViewDomManager = this;

        window.clickThumbnail = (targetType, targetName) => {
            const entity = this.system[targetType + 's'].find(x => x.name === targetName);
            this.selectTarget(entity.object3d);
            this.populateHtml();
        };

        window.handleTargetButton = (buttonState) => {
            /** @type {Entity} */
            const parentEntity = this.selectionSprite.selectionTarget.parentEntity;
            parentEntity.buttonState = buttonState;
            // let user know which button is selected
            document.getElementById(buttonState).style.background = '#A9A9A9'; // default color ButtonFace
        };

        window.handleAssignButton = () => {
            const defaultWork = 'farm';
            const workAllocation = this.selectionSprite.selectionTarget.parentEntity.colony.workAllocation;
            let totalAllocation = 0;
            for (var work in workAllocation) {
                const input = document.getElementById("assign" + work);
                workAllocation[work].allocation = input.value / 100;
                totalAllocation += Number(workAllocation[work].allocation);
            }
            if (totalAllocation == 0) {
                workAllocation[defaultWork].allocation = 1;
            } else {
                for (var work in workAllocation) {
                    workAllocation[work].allocation = workAllocation[work].allocation /
                        totalAllocation;
                }
            }
            this.populateConsoleBody();
        };

    }

    ////////////////////
    // Click Handlers //
    ////////////////////

    #clickHandler = (event) => {
        event.preventDefault();
        const selectionTarget = this.findSelectionTarget(event);
        this.selectTarget(selectionTarget);
        this.populateHtml();
    }

    #doubleClickHandler = (event) => {
        // on a doubleclick, previousTargets queue will look like:
        //     0: double-clicked object or object behind,
        //     1: double-clicked object,
        //     2: object before double-click
        // so it is safest to use previousTargets[1] as double-click target
        const clickTarget = this.previousTargets[1]
        // check if the target before double click was a ship
        if (this.previousTargets[2]?.parentEntity?.type == "ship") {
            this.moveShip(this.previousTargets[2], clickTarget, 'default');
        } else if (clickTarget?.parentEntity.type === "wormhole") {
            // navigate through wormhole (unless ship was just moved through wormhole)
            const systemId = clickTarget.parentEntity.toId;
            const path = "/systems/" + systemId;
            this.systemClickHandler(path);
            return;
        }
        this.populateHtml();
    }

    #rightClickHandler = (event) => {
        event.preventDefault();
        const currentSelection = this.selectionSprite.selectionTarget;
        if (!currentSelection) {
            return;
        }

        // Right-click handler for selected ships
        if (currentSelection.parentEntity.type == "ship") {
            const clickTarget = this.findSelectionTarget(event);
            this.moveShip(currentSelection, clickTarget, 'default');
        }
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
        this.populateHtml();
        window.selectionTarget = this.selectionSprite.selectionTarget;
    }

    unselectTarget() {
        if (this.selectionSprite.selectionTarget) {
            this.selectionSprite.unselect();
            this.previousTargets.push(null);
        }
    }

    /*
     * This function finds the object that the mouse is currently over (handy to fire
     * in the click handlers).
     * @param {event} event - the click event
     * @returns {THREE.Object3D} - the object that was clicked on
     * @returns {null} - if no object was clicked on
     */
    findSelectionTarget(event) {
        //const unselectableNames = ["selectionSprite", "wormholeText"];

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        let selection = null;
        // Loops through intersected objects (sorted by distance)
        for (let i = 0; i < intersects.length; i++) {
            let obj = this.getParentObject(intersects[i].object);
            // cannot click on wormhole text, selection sprite, clouds, etc.
            if (obj.notClickable) {
                continue;
            }
            // If current selectionTarget clicked again, remember it
            // but look for an object behind to select instead
            if (obj == this.selectionSprite.selectionTarget) {
                selection = obj;
            } else {
                // Returns a selection different from current selectionTarget
                selection = obj;
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

    /*
     * This function moves a ship to a target. If the target is a planet, it will orbit.
     * If the target is a wormhole, it will move through the wormhole.
     * If the target is an enemy ship, it will attack it.
     * If the target is a friendly ship, it will form up with it.
     * @param {THREE.Object3D} ship3d - the 3d object of the ship
     * @param {THREE.Object3D} target - the 3d object of the target
     * @param {string} mode - the mode of movement.  Choose: default, colonize, move, orbit, attack, formup
     */
    moveShip(ship3d, target = null, mode = 'default') {
        // ship3d is the 3d object and shipEntity is the JS object
        const shipEntity = ship3d.parentEntity;
        const shipId = shipEntity.name;
        const targetEntity = target ? target.parentEntity : null;
        // clear all movement
        shipEntity.resetMovement();

        // We need to send the shipId, targetId and mode to the server so it can
        // perform this logic also, updating it's system data and also sending the command
        // to all clients so they can preform the logic as well.


        if (mode == 'colonize' &&
            target &&
            target.parentEntity.type != 'planet') {
            alert("Only planets can be colonized");
            return;
        }

        // set targets based on movement mode
        // default behavior moves to target and orbits
        if (['default', 'move', 'orbit', 'colonize'].includes(mode) && target) {
            shipEntity.destinationTarget = targetEntity;
        }
        if (['default', 'orbit'].includes(mode) && target) {
            shipEntity.orbitTarget = targetEntity;
        }
        if (mode == 'colonize' && target && !targetEntity.colonizedBy) {
            shipEntity.colonizeTarget = targetEntity;
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
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const shipPlane = new THREE.Plane(new THREE.Vector3(0, 0, ship3d.position.z), -ship3d.position.z);
        const intersects = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(shipPlane, intersects);
        shipEntity.destinationPoint = { x: intersects.x, y: intersects.y, z: intersects.z };
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
        this.system[entity_type + "s"].forEach(entity => {
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
                            <div class="details">${entity.name}${details}
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
        const selectionTarget = this.selectionSprite.selectionTarget;
        const expandButtonDiv = document.getElementById('expand-button');
        if (selectionTarget) {
            html = selectionTarget.parentEntity.getConsoleHtml();
            if (selectionTarget.parentEntity.type == "planet" && selectionTarget.parentEntity.colony) {
                expandButtonDiv.style.display = 'inherit';
            } else {
                expandButtonDiv.style.display = 'none';
            }
        } else {
            html = this.eventLogHtml;
            expandButtonDiv.style.display = 'none';
        }
        document.getElementById("lower-console").innerHTML = html;
    }

    updateEventLogHtml(eventLog) {
        let html = "Event Log<br>";
        const maxDisplayCount = 5;
        for (let i = eventLog.length - 1; i >= Math.max(0, eventLog.length - maxDisplayCount); i--) {
            const event = eventLog[i];
            html += Math.round(event.time) + ": " + event.entry + "<br>";
        }
        this.eventLogHtml = html;
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
        this.mouseMovementHandler = (event) => {
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
        this.canvas.addEventListener('contextmenu', this.#rightClickHandler);
    }

    addMouseDoubleClick() {
        this.canvas.addEventListener('dblclick', this.#doubleClickHandler);
    }

    detachFromDom() {
        this.canvas.removeEventListener('mousemove', this.mouseMovementHandler);
        this.canvas.removeEventListener('click', this.#clickHandler);
        this.canvas.removeEventListener('dblclick', this.#doubleClickHandler);
        this.canvas.removeEventListener('contextmenu', this.#rightClickHandler);
    }

    //////////////////////
    // Drawing Commands //
    //////////////////////

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
