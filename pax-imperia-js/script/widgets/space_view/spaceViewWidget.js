import { SpaceViewAnimator } from './spaceViewAnimator.js';
import { SpaceViewDomManager } from './spaceViewDomManager.js';
import * as THREE from 'three';
import { SpriteFlipbook } from '../../models/spriteFlipbook.js'
import { System } from './entities/system.js';

/**
 * Encapsulates all of the logic related to rendering the SpaceView canvas
 * elements and supporting HTML.
 *
 * @constructor
 * @param {object} config             - The configurations defined in gameSettings.js.
 * @param {object} clientObjects      - clientObjects, or rather dom elements that are used by
 *                                      the widget to render the game or controls.
 * @param {object} gameStateInterface - The gameStateInterface exposes system data and
 *                                      the gameClock data to the widget.
 */
export class SpaceViewWidget {
    /** @type {SpaceViewAnimator} */
    spaceViewAnimator;

    /** @type {SpaceViewDomManager} */
    spaceViewDomManager;

    /** @type {System} */
    system;

    constructor(config, clientObjects, gameStateInterface) {
        this.c = config;
        this.clientObjects = clientObjects;
        this.galaxy = gameStateInterface.galaxy;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        // debug
        window.galaxy = this.galaxy;
        this.basePath = window.location.hash.includes("#") ? "/pax-imperia-clone" : "";

        const mouse = new THREE.Vector2(0, 0);
        this.clientObjects.mouse = mouse;
        this.clientObjects.gameClock = gameStateInterface.gameClock;
    }

    loadWidget(systemIndex, systemClickHandler) {
        this.systemClickHandler = systemClickHandler;
        this.system = this.galaxy.systems[systemIndex];

        // TODO: fix this so the console is created by the widget
        // this.clientObjects.consoleDiv.innerHTML = "Resume";

        this.clientObjects.distanceSlider = document.getElementById("distance-slider");

        this.setupRenderer();
        this.resetThreeObjects();

        return this.buildSystemClasses()
    }

    resetThreeObjects() {
        this.clientObjects.scene = new THREE.Scene();
        this.clientObjects.camera = new THREE.PerspectiveCamera(15, this.c.canvasWidth / this.c.canvasHeight, 1, 10000);

        this.clientObjects.selectionSprite = new SpriteFlipbook(
            this.clientObjects.scene,
            this.basePath + '/assets/sprite_sheets/selection_sprite_sheet.png',
            1,  // nCols in sprite sheet
            10, // nRows
            0.04); // loopFrameDuration
    }

    changeSystem(systemIndex) {
        console.log(">>> CHANGING SYSTEM <<<");
        this.spaceViewDomManager.detachFromDom();
        this.system = this.galaxy.systems[systemIndex];

        this.resetThreeObjects();

        return this.buildSystemClasses()
    }

    buildSystemClasses() {
        this.spaceViewDomManager = new SpaceViewDomManager(this.c, this.clientObjects, this.system, this.systemClickHandler);
        window.spaceViewDomManager = this.spaceViewDomManager; // currently necessary for ship movement which accesses global
        this.spaceViewDomManager.attachDomEventsToCode();
        this.spaceViewDomManager.populateHtml();

        this.spaceViewAnimator = new SpaceViewAnimator(this.c, this.clientObjects, this.system, this.galaxy);
        return this.spaceViewAnimator.populateScene();
    }

    setupRenderer() {
        const renderer = this.renderer;
        renderer.resetState();
        this.clientObjects.renderer = renderer;
        this.clientObjects.cx = renderer.getContext();
        this.renderer = renderer;

        renderer.setSize(this.c.canvasWidth, this.c.canvasHeight);
        renderer.setPixelRatio(renderer.domElement.devicePixelRatio);
        document.getElementById("canvas-div").appendChild(renderer.domElement);
    }

    draw() {
        this.spaceViewAnimator.drawLoop();
    }

    detachFromDom() {
        this.spaceViewDomManager.detachFromDom();
    }

}
