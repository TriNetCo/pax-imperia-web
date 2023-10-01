import * as THREE from 'three';
import { SpaceViewLoader } from './spaceViewLoader.js';
import { getBasePath } from '../../models/helpers.js';

export class SpaceViewAnimator {

    constructor(config, clientObjects, system, galaxy, threeCache) {
        this.c = config;
        this.clientObjects = clientObjects;
        this.system = system;
        this.galaxy = galaxy;
        this.threeCache = threeCache;

        // unpack clientObjects
        this.scene = clientObjects.scene;
        this.selectionSprite = clientObjects.selectionSprite;
        this.renderer = clientObjects.renderer;
        this.camera = clientObjects.camera;
        this.cx = clientObjects.cx;
        this.mouse = clientObjects.mouse;
        this.clock = clientObjects.gameClock;
        this.count = 0;

        THREE.Cache.enabled = true  // for development,  please set this to false :)
    }

    stopDrawLoop() {
        this.isDrawLoopEnabled = undefined;

        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }

    startDrawLoop() {
        this.isDrawLoopEnabled = true;
        this.drawLoop();
    }

    //
    /**
     * Redraw everything 60 times a second.  If `this.isDrawLoopEnabled` is set
     * to false, this function will simply return, otherwise the function will
     * call `this.animate()` before recurisvely calling itself via
     * the browser's requestAnimationFrame API.
     */
    drawLoop() {
        if (!this.isDrawLoopEnabled) return;
        this.animate();
        this.requestId = requestAnimationFrame(() => {
            this.drawLoop();
        });
    }

    async animate() {
        // console.log("resetting camera")
        // TODO: should camera reset every frame??
        this.resetCamera()
        // console.log("UpdatingObjects")
        this.updateObjects()
        // console.log("Performing render")
        const startTime = Date.now()
        this.renderer.render(this.scene, this.camera);
        if (!this.firstRenderTime) {
            this.firstRenderTime = Date.now() - startTime
            console.log(this.firstRenderTime + " ms: theBlack (first render)")
        }
        // console.log("finished animating")
    }

    resetCamera() {
        // Reset camera in real time
        //////////////////////////////

        let distance = parseFloat(this.clientObjects.distanceSlider.value);

        // cameraPivot.rotation.set(xRotation, yRotation, 0.0);
        this.cameraPivot.rotation.set(-0.6, 0.05, -3);

        this.cameraPivot.position.set(0, 0, distance);
        this.camera.lookAt(this.scene.position);

        this.headLamp.position.set(0, 0, distance);
        // headLamp.lookAt(this.scene.position);

        this.camera.updateProjectionMatrix();
    }

    /**
     * Since reading and writing to the dom is really expensive, we try to do it only once per second when needed.
     * @param {number} elapsedTime
     */
    updateHtmlClock(elapsedTime) {
        if (Math.round(elapsedTime * 60) / 60 % 1 == 0) { // This check ensures we do something once every second
            document.getElementById("time").innerHTML = elapsedTime.toFixed(0);
        };
    }

    updateObjects() {
        // seconds since clock reset
        let deltaTime = this.clock.getDelta();
        // seconds since clock started (avoiding getElapsedTime() which resets clock)
        let elapsedTime = this.clock.elapsedTime;

        this.updateHtmlClock(elapsedTime);

        // TODO: use elapsedTime instead of deltaTime
        this.selectionSprite.update(deltaTime);

        for (const star of this.system['stars']) {
            star.update(elapsedTime);
        }

        for (const planet of this.system['planets']) {
            planet.update(elapsedTime);
        }

        for (const ship of this.system['ships']) {
            ship.update(elapsedTime, deltaTime, this.system, this.galaxy);
        }

    }

    async populateScene() {
        const startTime = Date.now();
        const scene = this.scene;
        const system = this.system;

        // Add Lights

        var sunLight = new THREE.PointLight(new THREE.Color(), .7, 1000);
        scene.add(sunLight);

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        var keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(35, 38, 15);
        scene.add(keyLight);

        this.headLamp = new THREE.DirectionalLight(0xffffff, 0);
        this.headLamp.position.set(22, 22, 25);
        scene.add(this.headLamp);

        // Add Camera

        let camera = this.camera;
        scene.add(camera);

        var cameraLight = new THREE.PointLight(new THREE.Color(), 0, 10000);
        scene.add(cameraLight);
        camera.add(cameraLight);

        this.cameraPivot = new THREE.Group();
        camera.position.set(0, 0, 50);
        camera.lookAt(scene.position);
        this.cameraPivot.add(camera);
        scene.add(this.cameraPivot);

        // Load Models

        // TODO, PERFORMANCE: why isn't the background loading immediately after navigating systems
        await this.loadBackground(scene);
        console.log('background loads')
        this.resetCamera();
        this.renderer.render(this.scene, this.camera);

        const spaceViewLoader = new SpaceViewLoader(
            scene,
            system,
            this.renderer,
            this.camera,
            this.threeCache
        );
        this.renderer.compile(this.scene, this.camera);
        await spaceViewLoader.load();
        this.renderer.compile(this.scene, this.camera);
        // this.animate();

        const deltaTime = (Date.now() - startTime);
        console.log(deltaTime + ' ms: spaceViewAnimator#populateScene');
    }

    loadBackground(scene) {
        const basePath = getBasePath();
        const backgroundPath = basePath + "/assets/backgrounds/space_view_background_tmp.png"
        const loader = new THREE.TextureLoader();
        const backgroundPromise = new Promise(function (resolve, reject) {
            loader.load(backgroundPath, function (input) {
                scene.background = input;
                resolve()
            }, function (xhr) {
            }, function (error) {
                console.error(error);
                reject(error);
            });
        });
        return backgroundPromise;
    }

}