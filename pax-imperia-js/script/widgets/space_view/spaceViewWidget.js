import * as THREE from 'three';
import { SpaceViewAnimator } from './spaceViewAnimator.js';
import { SpaceViewDomManager } from './spaceViewDomManager.js';
import { SpriteFlipbook } from '../../models/spriteFlipbook.js'
import { System } from './entities/system.js';
import { getBasePath } from '../../models/helpers.js';
import { ThreeCache } from './threeCache.js';

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

    /** @type {THREE.WebGLRenderer} */
    renderer;

    /** @type {ThreeCache} */
    threeCache;

    constructor(config, clientObjects, gameStateInterface) {
        this.c = config;
        this.clientObjects = clientObjects;
        this.galaxy = gameStateInterface.galaxy;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.basePath = getBasePath();
        this.clientObjects.mouse = new THREE.Vector2(0, 0);
        this.clientObjects.gameClock = gameStateInterface.gameClock;
        this.threeCache = new ThreeCache();
        window.galaxy = this.galaxy; // for debugging
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
        console.log(">>> CHANGING SYSTEM <<<",
            this.system.id, this.system.name,
            "to", systemIndex, this.galaxy.systems[systemIndex].name);
        this.spaceViewDomManager.detachFromDom();
        this.spaceViewAnimator.stopDrawLoop();
        this.system = this.galaxy.systems[systemIndex];

        this.resetThreeObjects();

        return this.buildSystemClasses()
    }

    async buildSystemClasses() {
        this.spaceViewDomManager = new SpaceViewDomManager(this.c, this.clientObjects, this.system, this.systemClickHandler);
        window.spaceViewDomManager = this.spaceViewDomManager; // currently necessary for ship movement which accesses global
        this.spaceViewDomManager.attachDomEventsToCode();
        this.spaceViewDomManager.populateHtml();
        console.log('buildSystemClasses populateHtml')

        this.spaceViewAnimator = new SpaceViewAnimator(
            this.c,
            this.clientObjects,
            this.system,
            this.galaxy,
            this.threeCache
        );
        await this.spaceViewAnimator.populateScene();
        this.spaceViewAnimator.startDrawLoop();
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

    detachFromDom() {
        this.spaceViewDomManager.detachFromDom();
        this.spaceViewAnimator.stopDrawLoop();
    }

}
