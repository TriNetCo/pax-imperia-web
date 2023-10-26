import * as THREE from 'three';
import { Queue } from '../../models/helpers.js';
import { SpriteFlipbook } from '../../models/spriteFlipbook.js';
import Entity from './entities/entity.js';
import { System } from './entities/system.js';
import { GameStateInterface } from '../../gameStateInterface/gameStateInterface.js';
import { SpaceViewAnimator } from './spaceViewAnimator.js';
import { SpaceViewInputHandler } from './spaceViewInputHandler.js';

/**
 * This class handles interactions with the dom
 */
export class SpaceViewDomManager {

    /** @type {SpaceViewAnimator} */
    spaceViewAnimator;
    /** @type {SpaceViewInputHandler} */
    spaceViewInputHandler;

    /**
     *
     * @param {*} config
     * @param {Object} clientObjects
     * @param {SpriteFlipbook} clientObjects.selectionSprite - This is just a sprite that is used to show the selection
     * @param {System} system
     * @param {*} systemClickHandler
     * @param {GameStateInterface} gameStateInterface
     */
    constructor(config, clientObjects, system, systemClickHandler, gameStateInterface, spaceViewInputHandler) {
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
        this.spaceViewInputHandler = spaceViewInputHandler;

        // currently necessary for ship movement which accesses global
        // TODO: remove the dependency
        if (typeof window === 'undefined') return; // for testing, return here...

        window.spaceViewDomManager = this;

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
        this.spaceViewAnimator.zoomCamera(distance);
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

    doubleClickHandler = (event) => {
        // on a doubleclick, previousTargets queue will look like:
        //     0: double-clicked object or object behind,
        //     1: double-clicked object,
        //     2: object before double-click
        // so it is safest to use previousTargets[1] as double-click target
        const clickTarget = this.previousTargets[1]

        // check if the target before double click was a ship
        const subjectEntity = this.previousTargets[2] ? this.previousTargets[2].parentEntity : null;
        if (subjectEntity && subjectEntity.type == "ship") {
            subjectEntity.moveShip(clickTarget, 'default', this.mouse, this.camera);
            this.selectTarget(subjectEntity.object3d); // re-set ship as target after moving
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
        const currentSelection = this.selectionSprite.selectionEntity;
        if (!currentSelection) {
            return;
        }

        // Right-click handler for selected ships
        if (currentSelection.type == "ship") {
            const clickTarget = this.findSelectionTarget(event);
            currentSelection.moveShip(clickTarget, 'default', this.mouse, this.camera);
        }
    }

    #keyDownHandler = (event) => {
        const entry = { pressed: true, handled: false }
        this.spaceViewInputHandler.keyStates[event.key] = entry;
    }

    #keyUpHandler = (event) => {
        const entry = { pressed: false, handled: false }
        this.spaceViewInputHandler.keyStates[event.key] = entry;
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

        // TODO: this doesn't feel right... selectTarget results in a call to moveShip???  Why? is this method when a command is fired from the HTML DOM markup?
        if ( this.previousTargets[1] &&
             this.previousTargets[1].parentEntity.type == "ship" &&
             this.previousTargets[1].parentEntity.buttonState) {
            const buttonState = this.previousTargets[1].parentEntity.buttonState
            this.previousTargets[1].parentEntity.moveShip(this.previousTargets[0], buttonState, this.mouse, this.camera);
        }
        this.populateHtml();
        window.selectionTarget = this.selectionSprite.selectionTarget;
    }

    // TODO: Delete this unused function
    selectEntity(entity) {
        if (entity && entity?.object3d) {
            this.selectTarget(entity.object3d);
        }
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
        this.addKeyPresses();
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
        this.canvas.addEventListener('dblclick', this.doubleClickHandler);
    }

    addKeyPresses() {
        document.addEventListener('keydown', this.#keyDownHandler);
        document.addEventListener('keyup', this.#keyUpHandler);
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
        this.canvas.removeEventListener('dblclick', this.doubleClickHandler);
        this.canvas.removeEventListener('contextmenu', this.#rightClickHandler);
        document.removeEventListener('keydown', this.#keyDownHandler);
        document.removeEventListener('keyup', this.#keyUpHandler);
        const hudElement = document.getElementById('hud');
        if (hudElement) {
            hudElement.remove();
        }
    }

    //////////////////////
    // Drawing Commands //
    //////////////////////

    /**
     * This function recursively walks up the tree of parents until it finds the root scene
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
