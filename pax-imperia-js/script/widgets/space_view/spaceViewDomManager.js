import * as THREE from 'three';
import { SelectionSprite } from '../../models/selectionSprite.js';
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
     * @param {SelectionSprite} clientObjects.selectionSprite - This is just a sprite that is used to show the selection
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
        this.eventLogHtml = '';
        this.previousConsoleBodyHtml = '';
        this.spaceViewInputHandler = spaceViewInputHandler;

        // currently necessary for ship movement which accesses global
        // TODO: remove the dependency
        if (typeof window === 'undefined') return; // for testing, return here...

        window.spaceViewDomManager = this;

        window.clickThumbnail = (targetType, targetName) => {
            const entity = this.system[targetType + 's'].find(x => x.name === targetName);
            this.handleSelectionChange(entity.object3d);
            this.populateHtml();
        };

        window.handleTargetButton = (buttonState) => {
            /** @type {Entity} */
            const parentEntity = this.selectionSprite.selectionEntity;
            parentEntity.buttonState = buttonState;
            // let user know which button is selected
            document.getElementById(buttonState).style.background = '#A9A9A9'; // default color ButtonFace
        };

        window.handleAssignButton = () => {
            const colony = this.selectionSprite.selectionEntity.colony;
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
            const colony = this.selectionSprite.selectionEntity.colony;
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
            const colony = this.selectionSprite.selectionEntity.colony;
            colony.useAutoAssign = checked;

            if (checked) {
                colony.balanceWorkAllocation();
                colony.autoAllocateWork();

                this.populateConsoleBody();
                this.populateStaticConsole();
            }
        };

        window.handleBuildButton = (buildingType) => {
            const colony = this.selectionSprite.selectionEntity.colony;
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

    handleShowHideMap = (event) => {
        const hideableElement = document.getElementById('galaxy-and-console');
        const targetSetting = hideableElement.style.display == 'none' ? '' : 'none';
        hideableElement.style.display = targetSetting;

        const toggleButton = document.getElementById('map-button');
        const zoomDiv = document.getElementById('hud');

        if (targetSetting == 'none') {
            toggleButton.textContent = '^';
            toggleButton.classList.add('panel-minimized');
            zoomDiv.classList.add('hud-down');
        } else {
            toggleButton.textContent = 'v';
            toggleButton.classList.remove('panel-minimized');
            zoomDiv.classList.remove('hud-down');
        }

    }

    handleShowHideLeftPanel = (event) => {
        // alert('go into hiding');
        const hideableElement = document.getElementById('flex-container-left');
        const targetSetting = hideableElement.classList.contains('hidden') ? '' : 'hidden';
        const toggleButtonLabel = document.getElementById('left-panel-min-span');

        if (targetSetting == 'hidden') {
            hideableElement.classList.add('hidden');
            toggleButtonLabel.textContent = '>';
            toggleButtonLabel.className = 'minimized';
        } else {
            hideableElement.classList.remove('hidden');
            toggleButtonLabel.textContent = '<';
            toggleButtonLabel.className = 'maximized';
        }
    }

    ////////////////////
    // Click Handlers //
    ////////////////////

    #clickHandler = (event) => {
        event.preventDefault();
        if (event.detail === 2) { return; } // let the doubleclick handler handle this

        const selectionTarget = this.findSelectionTarget(event);
        this.handleSelectionChange(selectionTarget);
        this.populateHtml();
    }

    doubleClickHandler = (event) => {
        const clickTarget = this.selectionSprite.getPreviousTarget(0);

        // check if the target before double click was a ship
        const subjectEntity = this.selectionSprite.getPreviousTarget(1)?.parentEntity;
        if (subjectEntity?.type == 'ship') {
            subjectEntity.moveShip(clickTarget, 'default', this.mouse, this.camera);
            subjectEntity.select();
        } else if (clickTarget?.parentEntity.type === 'wormhole') {
            // navigate through wormhole (unless ship is being moved toward wormhole)
            const systemId = clickTarget.parentEntity.toId;
            const path = '/systems/' + systemId;
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
        if (currentSelection.type == 'ship') {
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

    // Selects an object3d if one is passed in, or
    // unselects if no object3d is passed in
    // and, if a ship was selected before and we're interacting with it
    //   via it's button consoles, perform the action associated with the button
    handleSelectionChange(object3d) {
        // select new target
        if (object3d) {
            this.selectionSprite.select(object3d);
        } else {
            this.selectionSprite.unselect();
        }

        this.handleSelectionWhenInteractingWithShipViaButtons();
    }

    handleSelectionWhenInteractingWithShipViaButtons() {
        if (this.isInteractingWithShipViaButtons()) {
            const ship = this.selectionSprite.getPreviousTarget(1).parentEntity;
            const shipTarget = this.selectionSprite.getPreviousTarget(0);

            const buttonState = ship.buttonState
            ship.moveShip(shipTarget, buttonState, this.mouse, this.camera);
            ship.select();
        }
    }

    isInteractingWithShipViaButtons() {
        const shipObject3d = this.selectionSprite.getPreviousTarget(1);

        return (shipObject3d
            && shipObject3d.parentEntity.type
            && shipObject3d.parentEntity.buttonState);
    }

    /**
     * This function finds the object that the mouse is currently over (handy to fire
     * in the click handlers).
     *
     * @param {event} event - the click event
     * @returns {THREE.Object3D} object3d - The object that was clicked on
     * @returns {null} null - if no object was clicked on
     */
    findSelectionTarget(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);


        // Loops through intersected objects (sorted by distance)
        let selection = null;
        for (let i = 0; i < intersects.length; i++) {
            const clickedObj = intersects[i].object;
            let obj = this.getParentObject(clickedObj);

            // cannot click on wormhole text, selection sprite, clouds, etc.
            if (clickedObj.notClickable) { continue; }
            if (obj.notClickable) { continue; }

            // If current selectionTarget clicked again, remember it
            // but look for an object behind to select instead
            if (obj == this.selectionSprite.selectionTarget) {
                selection = obj;
            } else {
                // Returns a selection different from current selectionTarget
                return obj;
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

    detachFromDom() {
        window.removeEventListener('resize', this.resetThreeObjectsAndUpdateCamera);
        this.canvas.removeEventListener('mousemove', this.mouseMovementHandler);
        this.canvas.removeEventListener('click', this.#clickHandler);
        this.canvas.removeEventListener('dblclick', this.doubleClickHandler);
        this.canvas.removeEventListener('contextmenu', this.#rightClickHandler);
        document.removeEventListener('keydown', this.#keyDownHandler);
        document.removeEventListener('keyup', this.#keyUpHandler);
        this.removeHud();
        this.removeLowerLeftHud();
        this.removeLeftPanelMinimizer();
    }

    attachDomEventsToCode(resetThreeObjects) {
        this.addHookForWindowResize(resetThreeObjects);
        this.addLeftPanelMinimizer();
        this.addLowerLeftHud();
        this.addHud();
        this.addMouseMovement();
        this.addMouseClick();
        this.addMouseDoubleClick();
        this.addKeyPresses();
    }

    addHookForWindowResize(resetThreeObjects) {
        this.resetThreeObjectsAndUpdateCamera = () => {
            this.camera = resetThreeObjects();
        }

        window.addEventListener('resize', this.resetThreeObjectsAndUpdateCamera);
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
        this.removeHud();

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

    removeHud() {
        const hudElement = document.getElementById('hud');
        if (hudElement) {
            hudElement.remove();
        }
    }

    addLowerLeftHud() {
        this.removeLowerLeftHud();

        // create HUD div
        const el = document.createElement('div');
        el.id = 'left-hud';
        el.classList.add('hud-btn');
        el.onclick = this.handleShowHideMap;

        // add button for map
        const mapButton = document.createElement('span');
        mapButton.id = 'map-button';
        mapButton.textContent = 'v';
        el.appendChild(mapButton);

        const canvasAndButtons = document.getElementById('canvas-and-buttons');
        canvasAndButtons.appendChild(el);
    }

    removeLowerLeftHud() {
        const hudElement = document.getElementById('left-hud');
        if (hudElement) {
            hudElement.remove();
        }
    }

    addLeftPanelMinimizer() {
        this.removeLeftPanelMinimizer();

        // create HUD div
        const el = document.createElement('div');
        el.id = 'left-panel-min-button';
        el.classList.add('hud-btn');
        el.onclick = this.handleShowHideLeftPanel;

        // add button for map
        const minimizeButton = document.createElement('span');
        minimizeButton.id = 'left-panel-min-span';
        minimizeButton.textContent = '<';
        el.appendChild(minimizeButton);

        const canvasAndButtons = document.getElementById('panel-minimize-div');
        canvasAndButtons.appendChild(el);
    }

    removeLeftPanelMinimizer() {
        const hudElement = document.getElementById('left-panel-min-button');
        if (hudElement) {
            hudElement.remove();
        }
    }

}
