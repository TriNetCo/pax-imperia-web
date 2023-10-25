import * as THREE from 'three';
import { SpaceViewAnimator } from "./spaceViewAnimator.js";
import { SpaceViewDomManager } from "./spaceViewDomManager.js";
import { System } from "./entities/system.js";
import Entity from "./entities/entity.js";

export class SpaceViewInputHandler {

    /** @type {SpaceViewAnimator} */
    spaceViewAnimator;
    /** @type {SpaceViewDomManager} */
    spaceViewDomManager;
    /** @type {Entity} */
    selectionTarget;

    /**
     * @param {System} system - The system object that contains all of the entities
     */
    constructor(system) {
        this.system = system;
        this.keyStates = {
            'Escape': { pressed: false, handled: false },
            ' ': { pressed: false, handled: false },
            'ArrowUp': { pressed: false, handled: false },
            'ArrowDown': { pressed: false, handled: false },
            'ArrowLeft': { pressed: false, handled: false },
            'ArrowRight': { pressed: false, handled: false }
        };
        this.buttonStates = {
            13: { pressed: false, handled: false }
        }
        this.laggedShipPosition = [];
        this.laggedShipQuaternion = [];
    }

    handleInputs() {
        this.selectedEntity = this?.spaceViewDomManager?.selectionSprite?.selectionTarget?.parentEntity;
        this.firstPersonGroup = this?.spaceViewAnimator?.firstPersonGroup;
        this.firstPersonEntity = this?.spaceViewAnimator?.firstPersonTarget?.parentEntity;
        this.firstPersonTarget = this?.spaceViewAnimator?.firstPersonTarget;

        this.handleKeyboardInputs();
        this.handleGamepadInputs();
    }

    handleGamepadInputs() {
        if (!navigator) return;
        const gamepad = navigator.getGamepads()[0];
        if (!gamepad) return;

        Object.entries(gamepad.buttons).forEach(([key, value]) => {
            if (value.pressed) {
                this.buttonStates[key].pressed = true;
                this.buttonStates[key].handled = this.buttonStates[key].handled || false;
            } else {
                this.buttonStates[key].pressed = false;
                this.buttonStates[key].handled = false;
            }
        });

        const xAxis = Math.floor(gamepad.axes[0] * 5);
        const yAxis = Math.floor(-gamepad.axes[1] * 5);
        if (this.spaceViewAnimator.firstPersonView) {
            // TODO: implement for controller
            // this.handleShipMovement3d(xAxis, yAxis);
        } else {
            this.handleShipMovement2d(xAxis, yAxis);
        }

        // right stick up/down moves zoom slider
        const r_yAxis = gamepad.axes[3];
        if (r_yAxis > 0.3 || r_yAxis < -0.3) {
            // Update zoom slider
            const distanceSlider = document.getElementById('distance-slider');
            const originalZoomValue = parseInt(distanceSlider.value);
            const newZoomValue = originalZoomValue + r_yAxis;
            distanceSlider.value = newZoomValue;
            this.spaceViewAnimator.zoomCamera(newZoomValue);
            console.log('zoom: ', newZoomValue);
        }

        // when we press down on the directional pad, we select the first ship in the system
        this.handlePerspectiveInput(this.buttonStates[13])
    }


    handleKeyboardInputs() {

        // if the spacebar key is pressed, select the first ship in the system
        // and switch to first person view
        this.handlePerspectiveInput(this.keyStates['Escape']);

        const arrowRight = this.keyStates['ArrowRight'];
        const arrowLeft = this.keyStates['ArrowLeft'];
        const arrowUp = this.keyStates['ArrowUp'];
        const ArrowDown = this.keyStates['ArrowDown'];

        const xAxis = arrowRight.pressed ? 1 : arrowLeft.pressed ? -1 : 0;
        const yAxis = arrowUp.pressed ? 1 : ArrowDown.pressed ? -1 : 0;

        if (this.spaceViewAnimator.firstPersonView) {
            const thrust = this.keyStates[' '].pressed ? 1 : 0;
            this.handleShipMovement3d(-xAxis, -yAxis, thrust);
        } else {
            this.handleShipMovement2d(xAxis, yAxis);
        }
    }

    handleShipMovement3d(xAxis, yAxis, thrust) {
        const firstPersonGroup = this.firstPersonGroup;
        const firstPersonShip = this.firstPersonTarget;
        if (!firstPersonShip) return;

        // if the left/ right button are pressed, rotate the ship left/right
        if (xAxis) {
            firstPersonShip.rotation.y += xAxis * 0.01;
        }

        if (yAxis) {
            firstPersonShip.rotation.x += -yAxis * 0.01;
        }

        if (thrust) {
            // const x = firstPersonGroup.rotation.x + firstPersonShip.rotation.x;
            // const y = firstPersonGroup.rotation.y + firstPersonShip.rotation.y;
            // const z = firstPersonGroup.rotation.z + firstPersonShip.rotation.z;
            // firstPersonGroup.rotation.set(x, y, z);
            // firstPersonGroup.rotation.copy(firstPersonShip.rotation);
            // firstPersonShip.rotation.set(0, 0, 0);
            firstPersonShip.translateZ(thrust * 0.05);
        }

        // saves ship's position and rotation
        this.saveShipVectors(firstPersonShip);
        // after x frames, update camera's position and rotation to match ship's
        this.updateFirstPersonGroup();
    }

    saveShipVectors(ship) {
        let position = new THREE.Vector3();
        ship.getWorldPosition(position);
        this.laggedShipPosition.unshift(position);

        let quaternion = new THREE.Quaternion()
        ship.getWorldQuaternion(quaternion)
        this.laggedShipQuaternion.unshift(quaternion);
    }

    updateFirstPersonGroup() {
        const lagSteps = 20;
        if (this.laggedShipPosition.length <= lagSteps) return;

        // attach the ship to scene so that it's not impacted by
        // changes to the firstPersonGroup
        this.spaceViewAnimator.scene.attach(this.firstPersonTarget);

        // why doesn't this work?
        // this.firstPersonGroup.position.set(this.laggedShipPosition[lagSteps]);
        // this.firstPersonGroup.quaternion.set(this.laggedShipQuaternion[lagSteps]);

        const laggedPosition = this.laggedShipPosition.pop();
        this.firstPersonGroup.position.set(
            laggedPosition.x,
            laggedPosition.y,
            laggedPosition.z
        );

        const laggedQuaternion = this.laggedShipQuaternion.pop();
        this.firstPersonGroup.quaternion.set(
            laggedQuaternion.x,
            laggedQuaternion.y,
            laggedQuaternion.z,
            laggedQuaternion.w
        );

        // reattach
        this.firstPersonGroup.attach(this.firstPersonTarget);
        this.spaceViewAnimator.camera.lookAt(this.firstPersonGroup.position);
    }

    handleShipMovement2d(xAxis, yAxis) {
        if (this.selectedEntity?.type != 'ship') return;

        // if x/y movement input not large enough, release ship controls
        if (xAxis < 0.4 & xAxis > -0.4 & yAxis < 0.4 & yAxis > -0.4) {
            if (this.selectedEntity.controllered) {
                this.selectedEntity.resetMovement();
            }
            return;
        }

        this.selectedEntity.setShipDestinationPointRelatively(xAxis, yAxis, 0);
    }

    handlePerspectiveInput(perspectiveKey) {
        if (perspectiveKey.pressed && !perspectiveKey.handled) {
            if (!this.spaceViewAnimator.firstPersonView) {
                perspectiveKey.handled = true;
                const firstShip = this.system.ships[0].object3d;
                const selectionTarget = this.spaceViewDomManager.selectionSprite.selectionTarget;
                const firstPersonTarget = selectionTarget || firstShip;
                this.spaceViewAnimator.switchToFirstPerson(firstPersonTarget);
            }
            else {
                perspectiveKey.handled = true;
                this.spaceViewAnimator.switchToThirdPerson();
            }
            this.laggedShipPosition = [];
            this.laggedShipQuaternion = [];
        }
    }

}