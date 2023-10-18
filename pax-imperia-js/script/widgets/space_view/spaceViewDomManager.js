import * as THREE from 'three';
import { Queue } from '../../models/helpers.js';
import { SpriteFlipbook } from '../../models/spriteFlipbook.js';
import Entity from './entities/entity.js';
import { Ship } from './entities/ship.js';
import { System } from './entities/system.js';
import { GameStateInterface } from '../../gameStateInterface/gameStateInterface.js';

/**
 * This class handles interactions with the dom
 */
export class SpaceViewDomManager {

    /**
     *
     * @param {*} config
     * @param {Object} clientObjects
     * @param {SpriteFlipbook} clientObjects.selectionSprite - This is just a sprite that is used to show the selection
     * @param {System} system
     * @param {*} systemClickHandler
     * @param {GameStateInterface} gameStateInterface
     */
    constructor(config, clientObjects, system, systemClickHandler, gameStateInterface) {
        this.c = config;
        this.system = system;
        this.systemClickHandler = systemClickHandler;
        this.gameStateInterface = gameStateInterface;

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
        this.previousConsoleBodyHtml = '';

        window.SpaceViewDomManager = this; // TODO: remove the dependency that Entity has on this global

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
            const colony = this.selectionSprite.selectionTarget.parentEntity.colony;
            const workAllocation = window.getDomWorkAllocations(colony)
            colony.setNewWorkAllocation(workAllocation);

            if (colony.useAutoAssign) {
                colony.autoAllocateWork();
            }
            this.populateConsoleBody();
            this.populateStaticConsole();
        };

        window.getDomWorkAllocations = (colony) => {
            const newWorkAllocation = structuredClone(colony.workAllocation);

            // update each work allocation in copy
            for (var work in newWorkAllocation) {
                const input = document.getElementById("assign" + work);
                newWorkAllocation[work] = Math.floor(input?.value) || 0;
                const workValueElement = document.getElementById(work + 'value');
                if (workValueElement) {
                    workValueElement.textContent = newWorkAllocation[work];
                }
            }
            return newWorkAllocation;
        }

        window.handleWorkSlider = () => {
            const colony = this.selectionSprite.selectionTarget.parentEntity.colony;
            const newWorkAllocation = window.getDomWorkAllocations(colony)

            // update total workers count
            const totalWorkAllocation = colony.getTotalWorkAllocation(newWorkAllocation);
            const totalWorkAllocationElement = document.getElementById("total-workers");
            totalWorkAllocationElement.textContent = totalWorkAllocation;
            if (totalWorkAllocation > colony.population) {
                totalWorkAllocationElement.style.color = "red";
            } else {
                totalWorkAllocationElement.style.color = "white";
            }
        };

        window.handleAutoAssign = (checked) => {
            const colony = this.selectionSprite.selectionTarget.parentEntity.colony;
            colony.useAutoAssign = checked;

            if (checked) {
                colony.balanceWorkAllocation();
                colony.autoAllocateWork();

                this.populateConsoleBody();
                this.populateStaticConsole();
            }
        };

        window.handleBuildButton = (buildingType) => {
            const colony = this.selectionSprite.selectionTarget.parentEntity.colony;
            colony.startBuilding(buildingType);

            this.populateConsoleBody();
            this.populateStaticConsole();
        }

        window.handleBuildShipButton = async (encodedSpec) => {
            const shipSpec = JSON.parse(encodedSpec.replaceAll("~", '"'));

            const shipConfig = {
                systemId: this.system.id,
                playerId: this.gameStateInterface.playerId,
                position: { x: 5, y: 0, z: 0 },
                shipSpec: shipSpec,
            };

            this.gameStateInterface.spawnShip(shipConfig);
        }

    }

    ////////////////////////
    // Handle Dom Changes //
    ////////////////////////

    handleDistanceSlider = (event) => {
        const distance = event.target.value;
        const spaceViewAnimator = this.gameStateInterface.spaceViewWidget.spaceViewAnimator;
        spaceViewAnimator.resetCamera(distance);
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
        /** @type {Ship} */
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
            shipEntity.destinationEntity = targetEntity;
        }
        if (['default', 'orbit'].includes(mode) && target) {
            shipEntity.orbitTarget = targetEntity;
        }
        if (mode == 'colonize' && target && !targetEntity.colony) {
            shipEntity.colonizeTarget = targetEntity;
        }
        if (['default', 'move'].includes(mode) && !target) {
            shipEntity.setShipDestinationPointFromMouse(this.mouse, this.camera);
        }



        // re-set ship as target after moving
        this.selectTarget(ship3d);
        // clear ship button state
        shipEntity.buttonState = null;
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
        this.populateStaticConsole();
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
        // default is the event log unless a target is selected
        let html = this.eventLogHtml;
        const selectionTarget = this.selectionSprite.selectionTarget;
        if (selectionTarget) {
            html = selectionTarget.parentEntity.getConsoleHtml();
        }

        // don't interact with DOM if nothing has changed
        if (html == this.previousConsoleBodyHtml) {
            return;
        }

        // show expand button when planet with colony selected
        const expandButtonDiv = document.getElementById('expand-button');
        if (selectionTarget?.parentEntity?.type == "planet" &&
            selectionTarget?.parentEntity?.colony) {
            expandButtonDiv.style.display = 'inherit';
        } else {
            expandButtonDiv.style.display = 'none';
        }

        document.getElementById("lower-console").innerHTML = html;
        this.previousConsoleBodyHtml = html;
    }

    populateStaticConsole() {
        let html = '';
        const selectionTarget = this.selectionSprite.selectionTarget;
        if (selectionTarget) {
            html = selectionTarget.parentEntity.getStaticConsoleHtml();
        }
        document.getElementById("static-console").innerHTML = html;
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
        this.addHud();
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

    addHud() {
        // create HUD div
        const el = document.createElement('div');
        el.id = 'hud';

        // add text "Zoom"
        const zoomSpan = document.createElement('span');
        zoomSpan.textContent = 'Zoom';
        el.appendChild(zoomSpan);

        // create slider
        const slider = document.createElement('input');
        slider.id = 'distance-slider';
        slider.type = 'range';
        slider.min = '-20';
        slider.max = '300';
        slider.step = '1';
        slider.defaultValue = '50';
        slider.oninput = this.handleDistanceSlider;
        el.appendChild(slider);

        const canvasAndButtons = document.getElementById('canvas-and-buttons');
        canvasAndButtons.appendChild(el);
    }

    detachFromDom() {
        this.canvas.removeEventListener('mousemove', this.mouseMovementHandler);
        this.canvas.removeEventListener('click', this.#clickHandler);
        this.canvas.removeEventListener('dblclick', this.#doubleClickHandler);
        this.canvas.removeEventListener('contextmenu', this.#rightClickHandler);
        const hudElement = document.getElementById('hud');
        if (hudElement) {
            hudElement.remove();
        }
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
