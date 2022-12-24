import * as THREE from 'three';
import { SystemLoader } from './systemLoader.js'


export class SpaceViewAnimator {

    constructor(config, clientObjects, systemData) {
        this.c = config;
        this.clientObjects = clientObjects;
        this.systemData = systemData;

        this.scene = clientObjects.scene;
        this.selectionSprite = clientObjects.selectionSprite;
        this.renderer = clientObjects.renderer;
        this.camera = clientObjects.camera;
        this.system = systemData;
        this.cx = clientObjects.cx;
        this.mouse = clientObjects.mouse;

        this.clock = new THREE.Clock();
        this.spinTime = 0;
    }

    drawLoop() {
        // Redraw everything 60 times a second
        // this.drawBackground();
        this.animate();
    }

    drawBackground() {
        let cx = this.cx;
        cx.fillStyle = "Black";
        cx.fillRect(0, 0, cx.canvas.width, cx.canvas.height);
    }

    animate() {
        let clock = this.clock;

        // Reset camera in real time
        //////////////////////////////

        let distance =  parseFloat( this.clientObjects.distanceSlider.value );
        let xRotation = this.clientObjects.xSlider.value;
        let yRotation = this.clientObjects.ySlider.value;
        let zRotation = this.clientObjects.zSlider.value;

        // cameraPivot.rotation.set(xRotation, yRotation, 0.0);
        this.cameraPivot.rotation.set(-0.6, 0.05, -3);

        this.cameraPivot.position.set(0, 0, distance);
        this.camera.lookAt( this.scene.position );

        this.headLamp.position.set(0, 0, distance);
        // headLamp.lookAt(this.scene.position);

        let ship = this.ships[0];
        ship.rotation.set(0.7, -1.6, 0.4);
        ship.position.set(zRotation, xRotation ,yRotation);


        this.camera.updateProjectionMatrix();

        // seconds since getDelta last called
        let deltaTime = clock.getDelta();

        this.selectionSprite.update(deltaTime); // UpdateSpriteFrame

        this.doRotationsAndOrbits(deltaTime);

        // debugger;
        this.renderer.render( this.scene, this.camera );
    }

    async populateScene() {
        const scene = this.scene;
        const system = await this.system;

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

        /////////////////
        // Load Models //
        /////////////////

        let systemLoader = new SystemLoader(system, scene);
        await systemLoader.loadStars()
        await systemLoader.loadPlanets()
        this.ships = await systemLoader.loadShips()
    }

    doRotationsAndOrbits (deltaTime) {
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

}
