import { Galaxy } from '../../models/galaxy.js';
import { SpaceViewDrawer } from './spaceViewDrawer.js';
import { SpaceViewDomManager } from './spaceViewDomManager.js';

import * as THREE from 'three';
import { SpriteFlipbook } from '/script/models/spriteFlipbook.js'
import { SystemLoader } from '/systems/systemLoader.js'

export class SpaceViewWidget {

    spaceViewDrawer;
    spaceViewDomManager;

    constructor(gameSettings) {
        this.c = gameSettings;
        const mouse = new THREE.Vector2(0,0);
        this.mouse = mouse;
        this.system = this.c.system;
    }

    beginGame(systemClickHandler) {

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

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 15, this.width / this.height, 1, 10000 );
        this.populateScene();

        this.selectionSprite = new SpriteFlipbook(
            this.scene,
            '/script/assets/sprite_sheets/selection_sprite_sheet.png',
            1,  // nCols in sprite sheet
            10, // nRows
            0.04); // loopFrameDuration

        this.spaceViewDrawer = new SpaceViewDrawer({cx: cx, system: this.system, mouse: this.mouse});
        this.spaceViewDomManager = new SpaceViewDomManager(cx, this.system, this.spaceViewDrawer, systemClickHandler, this.mouse, this.camera, this.scene, this.selectionSprite)
        this.spaceViewDomManager.attachDomEventsToCode();
        this.spaceViewDomManager.populatePlanetList(this.system);
    }

    draw() {
        this.spaceViewDrawer.drawLoop();
    }

    detachFromDom() {
        this.spaceViewDomManager.detachFromDom();
    }


    populateScene() {
        const scene = this.scene;

        // Add Lights

        // var light = new THREE.DirectionalLight( 0xffffff, 1 );
        // light.position.set(22, 22, 25);
        // light.lookAt(0,0,0);
        // scene.add( light );

        // light = new THREE.DirectionalLight( 0xffffff, 1 );
        // light.position.set(2, 2, 5);
        // light.lookAt(0,0,0);
        // scene.add( light );

        var sunLight = new THREE.PointLight(new THREE.Color(), 1.25, 1000);
        scene.add(sunLight);

        this.headLamp = new THREE.DirectionalLight( 0xffffff, 1 );
        this.headLamp.position.set(22, 22, 25);
        scene.add( this.headLamp );

        //var ambientLight = new THREE.AmbientLight( 0xffffff, 0.05 );
        //scene.add( ambientLight );

        // Add Camera

        let camera = this.camera;
        scene.add(camera);

        var cameraLight = new THREE.PointLight(new THREE.Color(), .5, 10000);
        scene.add(cameraLight);

        camera.add(cameraLight);

        scene.add(sunLight);

        this.cameraPivot = new THREE.Group();

        scene.add(this.cameraPivot);

        this.cameraPivot.add(camera);
        camera.position.set(0, 0, 50);
        camera.lookAt( scene.position );
    }


    async oneHugeFunction() {
        let system = this.c.system;
        let renderer = this.renderer;
        let c = this.c;

        ///////////////////////
        // Connect DOM Stuff //
        ///////////////////////

        const upperConsole = {
            print(msg) {
                c.consoleDiv.innerHTML = msg;
            }
        }

        const lowerConsole = {
            print(msg) {
                c.lowerConsoleDiv.innerHTML = msg;
            }
        }
        upperConsole.print("Resume");

        this.c.dom = {
            distanceSlider: document.getElementById("distance-slider"),
            xSlider: document.getElementById("x-slider"),
            ySlider: document.getElementById("y-slider"),
            zSlider: document.getElementById("z-slider")
        }


        //////////////////////////////////
        // Setup Animation/ Update Loop //
        //////////////////////////////////

        this.spinTime = 0;
        // uses client's clock for time info
        // starts the clock when .getDelta() is called for the first time
        this.clock = new THREE.Clock();
        const animate = () => {
            let clock = this.clock;

            // Reset camera in real time
            //////////////////////////////

            let distance =  this.c.dom.distanceSlider.value;
            let xRotation = this.c.dom.xSlider.value;
            let yRotation = this.c.dom.ySlider.value;
            let zRotation = this.c.dom.zSlider.value;

            // cameraPivot.rotation.set(xRotation, yRotation, 0.0);
            this.cameraPivot.rotation.set(-0.6, 0.05, -3);

            this.cameraPivot.position.set(0, 0, distance);
            this.camera.lookAt( this.scene.position );

            this.headLamp.position.set(0, 0, distance);
            // headLamp.lookAt(this.scene.position);

            ship.rotation.set(0.7, -1.6, 0.4);
            ship.position.set(zRotation, xRotation ,yRotation);


            this.camera.updateProjectionMatrix();

            // seconds since getDelta last called
            let deltaTime = clock.getDelta();

            this.selectionSprite.update(deltaTime); // UpdateSpriteFrame

            this.doRotationsAndOrbits(deltaTime);

            renderer.render( this.scene, this.camera );
            requestAnimationFrame(animate);
        }

        this.doRotationsAndOrbits = (deltaTime) => {
            let speedMultiplier = 1; //1/9 to slow down the whole system
            let system = this.system;
            this.spinTime += deltaTime * speedMultiplier;

            for (const starOrPlanet of system['stars'].concat(system['planets'])) {
                let object3d = starOrPlanet.object3d;

                object3d.rotation.y += 0.005;

                let d = starOrPlanet["distance_from_star"];
                if (d == 0) { // if the planet is the sun
                    object3d.rotation.x += 0.005;
                    continue;
                }
                let r = d*3;
                let startingPosition = starOrPlanet["starting_position"];

                // square of the planet's orbital period is proportional to the cube of its semimajor axis
                // pow(d, 3) = pow(period, 2), velocity = pow(1/d, 0.5), Math.pow(1/d, 0.5)
                object3d.position.x = r*Math.cos(this.spinTime * Math.pow(d, -2) + startingPosition) + 0;
                object3d.position.z = r*Math.sin(this.spinTime * Math.pow(d, -2) + startingPosition) + 0;
            }

        }

        /////////////////
        // Load Models //
        /////////////////

        let systemLoader = new SystemLoader(system, this.scene);
        await systemLoader.loadStars()
        await systemLoader.loadPlanets()
        let ships = await systemLoader.loadShips()
        let ship = ships[0];

        animate();

    }

}
