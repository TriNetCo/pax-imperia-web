import * as THREE from 'three';
import { SpaceViewLoader } from './spaceViewLoader.js';
import { GameStateInterface } from '../../gameStateInterface/gameStateInterface.js';
import CacheMonster from '../../models/cacheMonster.js';
import { Galaxy } from '../../models/galaxy.js';
import { System } from './entities/system.js';
import TimeLord from '../../models/timeLord.js';
import { SpaceViewDomManager } from './spaceViewDomManager.js';
import { SpaceViewInputHandler } from './spaceViewInputHandler.js';

export class SpaceViewAnimator {

    /** @type {THREE.WebGLRenderer} */
    renderer;
    /** @type {SpaceViewDomManager} */
    spaceViewDomManager;
    /** @type {SpaceViewInputHandler} */
    spaceViewInputHandler;

    /**
     *
     * @param {*} config
     * @param {*} clientObjects
     * @param {System} system
     * @param {Galaxy} galaxy
     * @param {CacheMonster} cacheMonster
     * @param {GameStateInterface} gameStateInterface
     */
    constructor(config, clientObjects, system, galaxy, cacheMonster, gameStateInterface) {
        this.c = config;
        this.clientObjects = clientObjects;
        this.system = system;
        this.galaxy = galaxy;
        this.cacheMonster = cacheMonster;
        this.gameStateInterface = gameStateInterface;
        this.fps = config?.fps || 60;
        this.gameClock = gameStateInterface.gameClock;

        // unpack clientObjects
        this.scene = clientObjects.scene;
        this.selectionSprite = clientObjects.selectionSprite;
        this.renderer = clientObjects.renderer;
        this.camera = clientObjects.camera;
        this.cx = clientObjects.cx;
        this.mouse = clientObjects.mouse;

        this.cameraDistance = 50;
        this.firstPersonView = false;
        this.frameClock = new THREE.Clock(true);

        THREE.Cache.enabled = true;  // for development,  please set this to false :)
    }

    stopDrawLoop() {
        this.isDrawLoopEnabled = undefined;

        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }

    startDrawLoop() {
        console.log('startDrawLoop')
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
        // skip frames according to fps setting
        const elapsedTime = this?.frameClock?.getElapsedTime() || 1;
        const fpsInterval = 1 / this.fps;
        if (elapsedTime < fpsInterval) return;
        this.frameClock.start();

        this.spaceViewInputHandler.handleInputs();
        this.updateObjects();
        const startTime = Date.now();
        this.renderer.render(this.scene, this.camera);
        if (!this.firstRenderTime) {
            this.firstRenderTime = Date.now() - startTime;
            console.log(this.firstRenderTime + " ms: theBlack (first render)");
        }
    }

    // trackCamera() {
    //     const distance = this.cameraDistance;
    //     if (this.firstPerson) {
    //         const v1 = new THREE.Vector3(0, 0, 1).applyQuaternion(this.firstPersonTarget.quaternion);
    //         this.camera.quaternion.copy(this.firstPersonTarget.quaternion);
    //         this.camera.position.copy(this.firstPersonTarget.position).add(v1.multiplyScalar(-2 * (distance - 49)));
    //         this.camera.lookAt(this.firstPersonTarget.position);
    //     }
    // }

    zoomCamera(distance) {
        this.cameraDistance = distance;
        if (this.firstPersonView) {
            this.camera.position.set(0, 2, -10 * (distance - 49));
            this.camera.lookAt(this.firstPersonGroup.position);
        } else {
            distance = distance * 2;
            this.camera.position.set(0, distance, 0);
            this.camera.lookAt(this.scene.position);
        }
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

    updateConsoleBody(elapsedTime) {
        // update once a second only when a target is selected
        if (Math.round(elapsedTime * 60) / 60 % 1 == 0 &&
            this?.spaceViewDomManager?.selectionSprite?.selectionTarget) {
            this.spaceViewDomManager.populateConsoleBody();
        }
    }


    updateObjects() {
        // seconds since clock reset
        const deltaTime = this.gameClock.getDelta();
        // seconds since clock started (avoiding getElapsedTime() which resets clock)
        const elapsedTime = this.gameClock.elapsedTime;

        // these happen once per second
        this.updateHtmlClock(elapsedTime);
        this.updateConsoleBody(elapsedTime);

        const actions = [];
        const logs = [];

        // TODO: use elapsedTime instead of deltaTime
        this.selectionSprite.update(deltaTime);

        for (const star of this.system['stars']) {
            star.update(elapsedTime);
        }

        for (const planet of this.system['planets']) {
            const planetLogs = planet.update(elapsedTime);
            logs.push(...planetLogs);
        }

        for (const ship of this.system['ships']) {
            const shipActions = ship.update(elapsedTime, deltaTime, this.system, this.galaxy);
            actions.push(...shipActions);
        }

        for (const action of actions) {
            this.gameStateInterface.performAction(action);
        }

        this.gameStateInterface.addEventLogEntries(logs);
    }

    async populateScene() {
        const timeLord = new TimeLord();
        const scene = this.scene;
        const system = this.system;

        // Add Camera

        this.addCameraToScene();

        // Add Lights
        this.addLightsToScene();

        // this.headLamp.position.set(0, 0, distance);
        // headLamp.lookAt(this.scene.position);

        //this.camera.updateProjectionMatrix();


        // Load Models
        const spaceViewLoader = new SpaceViewLoader(
            this.cacheMonster,
            scene,
            system,
            this.renderer,
            this.camera
        );
        this.spaceViewLoader = spaceViewLoader;

        await spaceViewLoader.loadBackground();
        this.renderer.render(this.scene, this.camera);
        timeLord.endAndReset('background')

        await spaceViewLoader.load();
        this.renderer.compile(this.scene, this.camera);
        timeLord.endAndReset('compile')

        // use animate instead of render so that there's not a lurch in time
        // when we call animate the first time in drawLoop
        await this.animate();
        timeLord.end('first animation')
    }

    addCameraToScene() {
        const distance = this.cameraDistance * 2;

        this.camera.position.set(0, distance, 0);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);

        this.cameraPivot = new THREE.Group();
        this.cameraPivot.position.set(0, 0, 0);
        this.cameraPivot.rotation.x = Math.PI * 1 / 3;
        this.cameraPivot.add(this.camera);
        this.scene.add(this.cameraPivot);
    }

    addLightsToScene() {
        var sunLight = new THREE.PointLight(new THREE.Color(), .7, 1000);
        this.scene.add(sunLight);

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        var keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(35, 38, 15);
        this.scene.add(keyLight);

        // this.headLamp = new THREE.DirectionalLight(0xffffff, 0);
        // this.headLamp.position.set(0, 0, this.cameraDistance);
        // this.scene.add(this.headLamp);

        // var cameraLight = new THREE.PointLight(new THREE.Color(), 0, 10000);
        // this.scene.add(cameraLight);
        // this.camera.add(cameraLight);
    }

    switchToThirdPerson() {
        this.firstPersonView = false;

        // set camera back
        this.camera.remove();
        this.camera = new THREE.PerspectiveCamera(15,
            this.c.canvasWidth / this.c.canvasHeight, 1, 30000);
        this.addCameraToScene();

        // remove ship obj3d from firstPersonGroup
        this.firstPersonTarget.removeFromParent();
        this.firstPersonTarget.position.copy(this.firstPersonGroup.position);
        this.firstPersonTarget.rotation.copy(this.firstPersonGroup.rotation);
        this.firstPersonGroup.remove();
        this.firstPersonGroup = null;
        this.scene.add(this.firstPersonTarget);

        // relink ship entity to ship obj3d
        this.firstPersonTarget.parentEntity.object3d = this.firstPersonTarget;
    }

    switchToFirstPerson(selectionTarget) {
        if (selectionTarget?.parentEntity?.type != 'ship') return;

        // selectionTarget.rotation.set(0, Math.PI * 1.5, 0);


        this.firstPersonTarget = selectionTarget;
        this.firstPersonEntity = selectionTarget.parentEntity;
        this.firstPersonEntity.firstPersonView = true;

        this.firstPersonGroup = new THREE.Group();
        this.firstPersonGroup.position.copy(selectionTarget.position);
        this.firstPersonGroup.rotation.copy(selectionTarget.rotation);
        this.scene.add(this.firstPersonGroup);

        selectionTarget.position.set(0, 0, 0);
        selectionTarget.rotation.set(0, 0, 0);
        this.firstPersonGroup.add(selectionTarget);

        selectionTarget.parentEntity.object3d = this.firstPersonGroup;
        this.firstPersonGroup.parentEntity = selectionTarget.parentEntity;
        this.spaceViewDomManager.selectTarget(this.firstPersonGroup);

        this.camera.removeFromParent();
        this.cameraPivot.remove();

        this.camera = new THREE.PerspectiveCamera(30, this.c.canvasWidth / this.c.canvasHeight, 1, 30000);
        this.firstPersonGroup.add(this.camera);
        this.camera.position.set(0, 2, -20);
        this.camera.lookAt(this.firstPersonGroup.position);

        this.spaceViewDomManager.selectTarget(null);

        this.firstPersonView = true;

    }

    async redrawWormholeText(wormhole) {
        // remove old wormhole text from scene
        const oldTextSprite = wormhole.textSprite;
        this.scene.remove(oldTextSprite);

        // redraw wormhole text in scene
        const newTextSprite = await this.spaceViewLoader.addWormholeText(wormhole);
        this.scene.add(newTextSprite);
    }

    async addOutline(entity) {
        // redraw wormhole text in scene
        console.log('addOutline');
        const outline = await this.spaceViewLoader.loadOutline(entity);
        this.scene.add(outline);
    }

}
