// import * as THREE from '/node_modules/three/build/three.module.js';
import * as THREE from 'three';

export class SpaceViewAnimator {

    constructor(config, clientObjects, system) {
        this.c = config;
        this.clientObjects = clientObjects;
        this.system = system;
        // debugger;

        this.scene = clientObjects.scene;
        this.selectionSprite = clientObjects.selectionSprite;
        this.renderer = clientObjects.renderer;
        this.camera = clientObjects.camera;
        this.cx = clientObjects.cx;
        this.mouse = clientObjects.mouse;

        this.clock = new THREE.Clock();
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

    async animate() {
        let clock = this.clock;

        // Reset camera in real time
        //////////////////////////////

        let distance =  parseFloat( this.clientObjects.distanceSlider.value );
        let xPosition = this.clientObjects.xSlider.value;
        let yPosition = this.clientObjects.ySlider.value;
        let zPosition = this.clientObjects.zSlider.value;

        // cameraPivot.rotation.set(xRotation, yRotation, 0.0);
        this.cameraPivot.rotation.set(-0.6, 0.05, -3);

        this.cameraPivot.position.set(0, 0, distance);
        this.camera.lookAt( this.scene.position );

        this.headLamp.position.set(0, 0, distance);
        // headLamp.lookAt(this.scene.position);

        let ship = this.system.ships[0].object3d;
        // if (ship === undefined) {
        //    debugger;
        // }
        // ship.rotation.set(0.7, -1.6, 0.4);
        ship.position.set(xPosition, yPosition, zPosition);

        this.camera.updateProjectionMatrix();

        // seconds since getDelta last called
        let deltaTime = clock.getDelta();
        let elapsedTime = clock.getElapsedTime();

        this.selectionSprite.update(deltaTime); // UpdateSpriteFrame

        this.doRotationsAndOrbits(elapsedTime);

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
        camera.position.set(0, 0, 50);
        camera.lookAt( scene.position );
        this.cameraPivot.add(camera);
        scene.add(this.cameraPivot);

        /////////////////
        // Load Models //
        /////////////////

        await system.load(scene);
    }

    doRotationsAndOrbits (elapsedTime) {
        let system = this.system;

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
            object3d.position.x = r*Math.cos(elapsedTime * Math.pow(d, -2) + startingPosition) + 0;
            object3d.position.z = r*Math.sin(elapsedTime * Math.pow(d, -2) + startingPosition) + 0;
        }

    }

}
