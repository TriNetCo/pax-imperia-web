import { Galaxy } from '../../models/galaxy.js';
import { SpaceViewAnimator } from './spaceViewAnimator.js';
import { SpaceViewDomManager } from './spaceViewDomManager.js';

import * as THREE from 'three';
import { SpriteFlipbook } from '/script/models/spriteFlipbook.js'

export class SpaceViewWidget {

    spaceViewAnimator;
    spaceViewDomManager;

    constructor(gameSettings) {
        this.c = gameSettings;
        const mouse = new THREE.Vector2(0,0);
        this.mouse = mouse;
        this.system = this.c.system;
    }

    async beginGame(systemClickHandler) {

        let c = this.c;
        const upperConsole = {
            print(msg) {
                c.consoleDiv.innerHTML = msg;
            }
        }

        upperConsole.print("Resume");

        c.dom = {
            distanceSlider: document.getElementById("distance-slider"),
            xSlider: document.getElementById("x-slider"),
            ySlider: document.getElementById("y-slider"),
            zSlider: document.getElementById("z-slider")
        }

        ////////////////////
        // Setup Renderer //
        ////////////////////

        this.renderer = new THREE.WebGLRenderer();

        this.width = 800;
        this.height = 500;
        this.renderer.setSize( this.width, this.height );
        this.renderer.setPixelRatio( this.renderer.domElement.devicePixelRatio );
        document.getElementById("canvas-div").appendChild( this.renderer.domElement );
        let cx = this.renderer.getContext();

        const scene = new THREE.Scene();
        this.c.scene = scene;
        this.camera = new THREE.PerspectiveCamera( 15, this.width / this.height, 1, 10000 );


        this.selectionSprite = new SpriteFlipbook(
            scene,
            '/script/assets/sprite_sheets/selection_sprite_sheet.png',
            1,  // nCols in sprite sheet
            10, // nRows
            0.04); // loopFrameDuration

        this.spaceViewAnimator = new SpaceViewAnimator({
            c: this.c,
            system: this.system,
            mouse: this.mouse,
            renderer: this.renderer,
            camera: this.camera,
            scene: scene,
            selectionSprite: this.selectionSprite});
        await this.spaceViewAnimator.populateScene();

        this.spaceViewDomManager = new SpaceViewDomManager(
            cx,
            this.system,
            this.spaceViewAnimator,
            systemClickHandler,
            this.mouse,
            this.camera,
            scene,
            this.selectionSprite)
        this.spaceViewDomManager.attachDomEventsToCode();
        this.spaceViewDomManager.populatePlanetList(this.system);
    }

    draw() {
        this.spaceViewAnimator.drawLoop();
    }

    detachFromDom() {
        this.spaceViewDomManager.detachFromDom();
    }

}
