import { Galaxy } from '../../models/galaxy.js';
import { SpaceViewAnimator } from './spaceViewAnimator.js';
import { SpaceViewDomManager } from './spaceViewDomManager.js';
import { System } from './entities/system.js';

// import * as THREE from 'three';
import * as THREE from '/node_modules/three/build/three.module.js';

import { SpriteFlipbook } from '../../models/spriteFlipbook.js'

export class SpaceViewWidget {

    spaceViewAnimator;
    spaceViewDomManager;

    constructor(config, clientObjects, systemsData) {
        this.c = config;
        this.clientObjects = clientObjects;
        this.systemsData = systemsData;
        window.systemsData = systemsData;

        const mouse = new THREE.Vector2(0,0);
        this.clientObjects.mouse = mouse;
    }

    async beginGame(systemIndex, systemClickHandler) {
        this.systemClickHandler = systemClickHandler
        this.setCurrentSystem(systemIndex)

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
            '/assets/sprite_sheets/selection_sprite_sheet.png',
            1,  // nCols in sprite sheet
            10, // nRows
            0.04); // loopFrameDuration

        this.spaceViewDomManager = new SpaceViewDomManager(this.c, this.clientObjects, this.system, this.systemClickHandler)
        this.spaceViewDomManager.attachDomEventsToCode();
        this.spaceViewDomManager.populatePlanetList();

        this.spaceViewAnimator = new SpaceViewAnimator(this.c, this.clientObjects, this.system);
        await this.spaceViewAnimator.populateScene();
    }

    async setCurrentSystem(systemIndex) {
        let systemData = this.systemsData[systemIndex]
        systemData.ships = [{"name": "ship", "index": 0}]
        this.system = new System(systemData);
    }

    draw() {
        this.spaceViewAnimator.drawLoop();
    }

    detachFromDom() {
        this.spaceViewDomManager.detachFromDom();
    }

}
