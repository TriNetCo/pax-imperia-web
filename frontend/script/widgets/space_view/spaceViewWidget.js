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
    }

    beginGame(systemClickHandler) {
        let c = this.c;

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

        this.selectionSprite = new SpriteFlipbook(
            this.scene,
            '/script/assets/sprite_sheets/selection_sprite_sheet.png',
            1,  // nCols in sprite sheet
            10, // nRows
            0.04); // loopFrameDuration

        this.spaceViewDrawer = new SpaceViewDrawer({cx: cx, system: this.system, mouse: this.mouse});
        this.spaceViewDomManager = new SpaceViewDomManager(cx, this.system, this.spaceViewDrawer, systemClickHandler, this.mouse, this.camera, this.scene, this.selectionSprite)
        this.spaceViewDomManager.attachDomEventsToCode();
    }

    draw() {
        this.spaceViewDrawer.drawLoop();
    }

    detachFromDom() {
        this.spaceViewDomManager.detachFromDom();
    }


    async oneHugeFunction() {
        let system = this.c.system;
        let renderer = this.renderer;

        ///////////////////////
        // Connect DOM Stuff //
        ///////////////////////

        const upperConsole = {
            print(msg) {
                document.getElementById("console-message").innerHTML = msg;
            }
        }

        const lowerConsole = {
            print(msg) {
                document.getElementById("lower-console").innerHTML = msg;
            }
        }

        const distanceSlider = document.getElementById("distance-slider");
        const xSlider = document.getElementById("x-slider");
        const ySlider = document.getElementById("y-slider");
        const zSlider = document.getElementById("z-slider");


        ////////////////////////////////////////
        // Setup the Scene with Basic Objects //
        ////////////////////////////////////////

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

        var headLamp = new THREE.DirectionalLight( 0xffffff, 1 );
        headLamp.position.set(22, 22, 25);
        scene.add( headLamp );

        //var ambientLight = new THREE.AmbientLight( 0xffffff, 0.05 );
        //scene.add( ambientLight );

        // Add Camera

        let camera = this.camera;
        scene.add(camera);

        var cameraLight = new THREE.PointLight(new THREE.Color(), .5, 10000);
        scene.add(cameraLight);

        camera.add(cameraLight);

        scene.add(sunLight);

        const cameraPivot = new THREE.Group();

        scene.add(cameraPivot);

        cameraPivot.add(camera);
        camera.position.set(0, 0, 50);
        camera.lookAt( scene.position );


        function doRotationsAndOrbits(deltaTime) {
            let speedMultiplier = 1; //1/9 to slow down the whole system
            spinTime += deltaTime * speedMultiplier;

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
                object3d.position.x = r*Math.cos(spinTime * Math.pow(d, -2) + startingPosition) + 0;
                object3d.position.z = r*Math.sin(spinTime * Math.pow(d, -2) + startingPosition) + 0;

            }

        }




        //////////////////////////////////
        // Setup Animation/ Update Loop //
        //////////////////////////////////

        let spinTime = 0;
        // uses client's clock for time info
        // starts the clock when .getDelta() is called for the first time
        const clock = new THREE.Clock();
        const animate = () => {

            // Reset camera in real time
            //////////////////////////////

            let distance = distanceSlider.value;
            let xRotation = xSlider.value;
            let yRotation = ySlider.value;
            let zRotation = zSlider.value;

            // cameraPivot.rotation.set(xRotation, yRotation, 0.0);
            cameraPivot.rotation.set(-0.6, 0.05, -3);

            cameraPivot.position.set(0, 0, distance);
            camera.lookAt( scene.position );

            headLamp.position.set(0, 0, distance);
            // headLamp.lookAt(scene.position);

            ship.rotation.set(0.7, -1.6, 0.4);
            ship.position.set(zRotation, xRotation ,yRotation);


            camera.updateProjectionMatrix();

            // seconds since getDelta last called
            let deltaTime = clock.getDelta();

            this.selectionSprite.update(deltaTime); // UpdateSpriteFrame

            doRotationsAndOrbits(deltaTime);

            renderer.render( scene, camera );
            requestAnimationFrame(animate);
        }


        /////////////
        // Main... //
        /////////////

        upperConsole.print("Resume");


        ////////////////////////////////////
        // Populate HTML based on JS data //
        ////////////////////////////////////

        populatePlanetList(system);
        window.system = system;

        function populatePlanetList(system) {
            let planetListUl = document.getElementById("planet-list");
            let html = "<h3>Planets:</h3>";
            html += "<ul>";
            let name = system["name"];

            system["planets"].forEach( planet => {
                let index = planet["index"];
                let planetFullName = name + " " + index;

                html += "<li onclick='alert(\"hi\")''>" + planetFullName + "</li>";

            });

            html += "</ul>";
            planetListUl.innerHTML = html;
        }

        /////////////////
        // Load Models //
        /////////////////

        let systemLoader = new SystemLoader(system, scene);
        await systemLoader.loadStars()
        await systemLoader.loadPlanets()
        let ships = await systemLoader.loadShips()
        let ship = ships[0];

        animate();


        /* This function recursively walks up the tree of parents until it finds the root scene
        * and removes the highest order group from that scene.
        */
        function removeContainerFromScene(container) {
            let parent = container.parent;

            if (parent.type == "Scene") {
                console.log("Deleting object at (" + container.position.x
                + ", " + container.position.y
                + ", " + container.position.z + ")");
                parent.remove(container);
            } else {
                removeContainerFromScene(container.parent);
            }
        }



    }

}
