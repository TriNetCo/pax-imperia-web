import { SpaceViewAnimator } from './spaceViewAnimator.js';
import { SpaceViewDomManager } from './spaceViewDomManager.js';
import * as THREE from 'three';
import { SpriteFlipbook } from '../../models/spriteFlipbook.js'

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

    spaceViewAnimator;
    spaceViewDomManager;

    constructor(config, clientObjects, gameStateInterface) {
        this.c = config;
        this.clientObjects = clientObjects;
        this.galaxy = gameStateInterface.galaxy;
        // debug
        window.galaxy = this.galaxy;
        this.basePath = window.location.hash.includes("#") ? "/pax-imperia-clone" : "";

        const mouse = new THREE.Vector2(0,0);
        this.clientObjects.mouse = mouse;
        this.clientObjects.gameClock = gameStateInterface.gameClock;
    }

    async loadWidget(systemIndex, systemClickHandler) {
        this.systemClickHandler = systemClickHandler
        this.system = this.galaxy.systems[systemIndex];

        // TODO: fix this so the console is created by the widget
        // this.clientObjects.consoleDiv.innerHTML = "Resume";

        this.clientObjects.distanceSlider = document.getElementById("distance-slider")
        this.clientObjects.xSlider = document.getElementById("x-slider")
        this.clientObjects.ySlider = document.getElementById("y-slider")
        this.clientObjects.zSlider = document.getElementById("z-slider")

        ////////////////////
        // Setup Renderer //
        ////////////////////

        let renderer = new THREE.WebGLRenderer();
        this.clientObjects.renderer = renderer

        renderer.setSize( this.c.canvasWidth, this.c.canvasHeight );
        renderer.setPixelRatio( renderer.domElement.devicePixelRatio );
        document.getElementById("canvas-div").appendChild( renderer.domElement );
        this.clientObjects.cx = renderer.getContext();

        const scene = new THREE.Scene();
        this.clientObjects.scene = scene;
        this.clientObjects.camera = new THREE.PerspectiveCamera( 15, this.c.canvasWidth / this.c.canvasHeight, 1, 10000 );


        this.clientObjects.selectionSprite = new SpriteFlipbook(
            scene,
            this.basePath + '/assets/sprite_sheets/selection_sprite_sheet.png',
            1,  // nCols in sprite sheet
            10, // nRows
            0.04); // loopFrameDuration

        this.spaceViewDomManager = new SpaceViewDomManager(this.c, this.clientObjects, this.system, this.systemClickHandler)
        this.spaceViewDomManager.attachDomEventsToCode();
        this.spaceViewDomManager.populateHtml();
        // make spaceViewDomManager global
        window.spaceViewDomManager = this.spaceViewDomManager;

        this.spaceViewAnimator = new SpaceViewAnimator(this.c, this.clientObjects, this.system, this.galaxy);
        await this.spaceViewAnimator.populateScene();
    }

    draw() {
        this.spaceViewAnimator.drawLoop();
    }

    detachFromDom() {
        this.spaceViewDomManager.detachFromDom();
    }

}
