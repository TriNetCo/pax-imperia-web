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

        // unpack clientObjects
        this.scene = clientObjects.scene;
        this.selectionSprite = clientObjects.selectionSprite;
        this.renderer = clientObjects.renderer;
        this.camera = clientObjects.camera;
        this.cx = clientObjects.cx;
        this.mouse = clientObjects.mouse;
        this.clock = clientObjects.gameClock;

        this.cameraDistance = 50;
        this.firstPersonView = false;

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
        // TODO: should camera reset every frame??
        // this.trackCamera();
        this.handleInputs();
        this.updateObjects();
        const startTime = Date.now();
        this.renderer.render(this.scene, this.camera);
        if (!this.firstRenderTime) {
            this.firstRenderTime = Date.now() - startTime;
            console.log(this.firstRenderTime + " ms: theBlack (first render)");
        }
    }

    // TODO: This wants to live in it's own file
    handleInputs() {
        this.handleKeyboardInputs();
        this.handleGamepadInputs();
    }

    handleGamepadInputs() {
        if (!navigator) return;
        const gamepad = navigator.getGamepads()[0];
        if (!gamepad) return;

        const xAxis = Math.floor(gamepad.axes[0] * 5);
        const yAxis = Math.floor(-gamepad.axes[1] * 5);
        this.handleShipMovement2d(xAxis, yAxis);

        // right stick up/down moves zoom slider
        const r_yAxis = gamepad.axes[3];
        if (r_yAxis > 0.3 || r_yAxis < -0.3) {
            // Update zoom slider
            const distanceSlider = document.getElementById('distance-slider');
            const originalZoomValue = parseInt(distanceSlider.value);
            const newZoomValue = originalZoomValue + r_yAxis;
            distanceSlider.value = newZoomValue;
            this.zoomCamera(newZoomValue);
            console.log('zoom: ', newZoomValue);
        }

        // when we press down on the directional pad, we select the first ship in the system
        if (gamepad.buttons[13].pressed) {
            const firstShip = this.system.ships[0];
            firstShip.select();
        }
    }


    handleKeyboardInputs() {
        const pressedKeys = this?.spaceViewDomManager?.pressedKeys;
        if (!pressedKeys) return;

        // if the spacebar key is pressed, select the first ship in the system
        // and switch to first person view
        if (pressedKeys[' ']) {
            if (!this.firstPersonView) {
                const firstShip = this.system.ships[1];
                firstShip.select();
                this.switchToFirstPerson(firstShip.object3d);
                firstShip.select();
            }
            else {
                this.firstPersonView = false;
            }
        }

        const xAxis = pressedKeys['ArrowRight'] ? 1 : pressedKeys['ArrowLeft'] ? -1 : 0;
        const yAxis = pressedKeys['ArrowUp'] ? 1 : pressedKeys['ArrowDown'] ? -1 : 0;

        this.handleShipMovement3d(xAxis, yAxis, pressedKeys);
        // this.handleShipMovement2d(xAxis, yAxis);
    }

    handleShipMovement3d(xAxis, yAxis, pressedKeys) {

        // if the left/ right button are pressed, rotate the ship left/right
        if (xAxis) {
            const selectedEntity = this?.selectionSprite?.selectionTarget?.parentEntity;
            if (selectedEntity?.type != 'ship') return;
            const obj3d = selectedEntity.object3d;

            obj3d.rotation.y = obj3d.rotation.y + xAxis * -0.1;
        }

        if (yAxis) {
            const selectedEntity = this?.selectionSprite?.selectionTarget?.parentEntity;
            if (selectedEntity?.type != 'ship') return;
            const obj3d = selectedEntity.object3d;

            obj3d.rotation.x = obj3d.rotation.x + yAxis * 0.1;
        }


    }

    handleShipMovement2d(xAxis, yAxis) {
        const selectedEntity = this?.selectionSprite?.selectionTarget?.parentEntity;
        if (selectedEntity?.type != 'ship') return;

        // if x/y movement input not large enough, release ship controls
        if (xAxis < 0.4 & xAxis > -0.4 & yAxis < 0.4 & yAxis > -0.4) {
            if (selectedEntity.controllered) {
                selectedEntity.resetMovement();
            }
            return;
        }

        if (this.firstPersonView) {
            selectedEntity.setShipDestinationPointRelatively(0, yAxis, xAxis);
        } else {
            selectedEntity.setShipDestinationPointRelatively(xAxis, yAxis, 0);
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
        const deltaTime = this.clock.getDelta();
        // seconds since clock started (avoiding getElapsedTime() which resets clock)
        const elapsedTime = this.clock.elapsedTime;

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

        await this.animate();
        timeLord.end('first animation')
    }

    addCameraToScene() {
        const distance = 50 * 2;

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

    switchToFirstPerson(selectionTarget) {

        const t = selectionTarget;
        t.rotation.y = 3.14 * 1.5
        t.rotation.x = 0;
        t.rotation.z = 0;

        // selectionTarget.add(this.cameraPivot);
        // this.camera.position.set(0, 0, this.cameraDistance);
        // this.camera.lookAt(selectionTarget);
        // this.camera.updateProjectionMatrix();

        this.firstPersonView = true;
        this.firstPersonTarget = selectionTarget;
        selectionTarget.parentEntity.firstPersonView = true;

        // const v1 = new THREE.Vector3(0, 0, 1).applyQuaternion(selectionTarget.quaternion);
        // this.camera.quaternion.copy(selectionTarget.quaternion);
        // this.camera.position.copy(selectionTarget.position).add(v1.multiplyScalar(-2));
        // this.camera.lookAt(selectionTarget.position);
        this.firstPersonGroup = new THREE.Group();
        this.firstPersonGroup.position.copy(selectionTarget.position);
        this.firstPersonGroup.rotation.copy(selectionTarget.rotation);
        this.scene.add(this.firstPersonGroup);

        selectionTarget.position.set(0, 0, 0);
        selectionTarget.rotation.set(0, 0, 0);
        this.firstPersonGroup.add(selectionTarget);

        selectionTarget.parentEntity.object3d = this.firstPersonGroup;
        this.firstPersonGroup.parentEntity = selectionTarget.parentEntity;

        this.camera.removeFromParent();
        this.camera.position.set(0, 2, -10);
        this.firstPersonGroup.add(this.camera);
        this.camera.lookAt(this.firstPersonGroup.position);

        // // this.cameraPivot.remove();
        // // this.scene.add(this.camera);
        // this.camera.position.set(0, 0, 0);
        // this.firstPersonTarget.add(this.camera);
        // // this.camera.position.z = -2;
        // // this.camera.position.set(0, -10, 0);
        // this.camera.lookAt(this.firstPersonTarget.position);

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
