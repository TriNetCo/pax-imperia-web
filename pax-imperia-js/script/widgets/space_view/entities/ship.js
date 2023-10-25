import Entity from './entity.js';
import { roundToDecimal, getRandomNum } from '../../../models/helpers.js';
import * as THREE from 'three';
import { Galaxy } from '../../../models/galaxy.js';

export class Ship extends Entity {

    constructor(shipConfig) {
        super();

        this.id = shipConfig?.id;
        this.playerId = shipConfig?.playerId;
        this.systemId = shipConfig?.systemId;
        this.make = shipConfig?.shipSpec?.make;
        this.model = shipConfig?.shipSpec?.model;
        this.size = shipConfig?.shipSpec?.size || 1;
        this.scale = { x: this.size, y: this.size, z: this.size };
        this.position = shipConfig?.position || { x: 0, y: 0, z: 0 };
        this.name = shipConfig?.name || "Galactic Potato " + shipConfig?.id;

        this.type = 'ship';
        this.playerId = 1;
        this.assetFolder = '/assets/ships/';
        this.object3ds = {};

        this.assetPath = `${this.assetFolder}Meshes/${this.make}/${this.make}${this.model}.fbx`;
        this.texturePath = `${this.assetFolder}Textures/${this.make}/${this.make}_White.png`;
        this.normalMapPath = `${this.assetFolder}Textures/${this.make}/${this.make}_Normal.png`;
        this.metallicSmoothnessMapPath = `${this.assetFolder}Textures/${this.make}/${this.make}_MetallicSmoothness.png`;
        this.emissionMapPath = `${this.assetFolder}Textures/${this.make}/${this.make}_Emission2.png`;

        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/ship_thumbnail.png";
        this.scale = { x: this.size, y: this.size, z: this.size };
        this.defaultRotation = { x: Math.PI / 4, y: -Math.PI / 2, z: Math.PI / 8 };
        this.rotation = this.defaultRotation;
        this.speed = 0.2; // per frame at 60 fps
        this.previousSystemId = typeof this.previousSystemId === 'undefined' ? null : this.previousSystemId;
        this.buttonState = null;
        // movement animation attributes
        this.destinationPoint = null; // x, y, z coordinates
        this.destinationEntity = null; // entity object
        this.orbitTarget = null; // entity object
        this.orbitStartTime = null; // radians
        this.colonizeTarget = null; // entity object
        this.colonizeAnimationProgress = null; // 0 to 1
        this.actions = [];

        this.raycaster = new THREE.Raycaster();
        this.controllered = false; // When this is true, mouse movement will not work
    }

    toJSON() {
        return ({
            name: this.name,
            id: this.id,
            playerId: this.playerId,
            position: this.position,
            make: this.make,
            model: this.model,
            size: this.size,
        });
    }

    update(elapsedTime, deltaTime, system, galaxy) {
        this.handleWormholeJumping(deltaTime, galaxy);
        this.recalculateDestinationPoint(this.destinationEntity);
        this.handleColonizing(deltaTime, galaxy);
        this.moveToDestinationPoint(deltaTime);
        this.handleOrbiting(elapsedTime);

        // update HTML but don't send to DOM unless it has changed
        this.updateConsoleBodyHtml();

        if (this.object3ds['outline']) {
            const { x, y, z } = this.object3d.position;
            this.object3ds['outline'].position.set(x, y, z);
        }

        // return actions for GameStateInterface to handle
        const actions = this.actions;
        this.actions = []; // clear actions
        return actions;
    };

    updateConsoleBodyHtml() {
        // leave blank if not player 1
        if (this.playerId != 1) {
            this.consoleBody = ''
            return;
        }

        const previousConsoleBody = this.consoleBody;
        this.consoleBody = '<div>';
        if (this.destinationEntity) {
            this.consoleBody += 'Destination: ' +
                this.destinationEntity.name + ' ' +
                this.destinationEntity.type;
        } else if (this.destinationPoint) {
            this.consoleBody += 'Destination: ' +
                roundToDecimal(this.destinationPoint.x, 2) +
                ", " +
                roundToDecimal(this.destinationPoint.y, 2) +
                ", " +
                roundToDecimal(this.destinationPoint.z, 2);
        } else if (this.orbitTarget) {
            this.consoleBody += 'Orbiting: ' +
                this.orbitTarget.name + ' ' +
                this.orbitTarget.type;
        }
        this.consoleBody += '</div>';
        if (previousConsoleBody != this.consoleBody) {
            window.spaceViewDomManager.populateHtml();
        }
    }

    resetMovement() {
        this.destinationPoint = null;
        this.destinationEntity = null;
        this.orbitTarget = null;
        this.orbitStartTime = null;
        this.colonizeTarget = null;
        this.colonizeAnimationProgress = null;
        this.controllered = false;
    }

    setShipDestinationPointFromMouse(mouse, camera) {
        this.destinationPoint = this.findClickIntersection(mouse, camera);
    }

    /**
     * Find intersection between mouse click and plane of ship.
     *
     * @param {*} mouse
     * @param {*} camera
     * @returns
     */
    findClickIntersection(mouse, camera) {
        this.raycaster.setFromCamera(mouse, camera);

        const shipPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));

        const intersects = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(shipPlane, intersects);
        return intersects;
    }

    setShipDestinationPointRelatively(x, y, z) {
        const posX = this.position.x + x;
        const posY = this.position.y + y;
        const posZ = this.position.z + z;

        this.destinationPoint = { x: posX, y: posY, z: posZ };
        this.controllered = true;
    }

    async handleWormholeJumping(deltaTime, galaxy) {
        if (!this.destinationEntity || this.destinationEntity?.type != 'wormhole') {
            return;
        }
        // if ship is close enough to wormhole, move it to the next system
        const distanceFromDest = this.object3d.position.distanceTo(
            this.destinationEntity.object3d.position);
        const toSystemId = this.destinationEntity.toId;
        if (distanceFromDest <= this.speed * deltaTime * 60) {
            this.discoverSystem(this.destinationEntity.id);
            // copy ship data to wormhole system data
            this.resetMovement();
            this.removeObject3d();
            // delete ship from current system
            this.removeFromSystem(galaxy);
            // move to new system
            this.pushToSystem(toSystemId, galaxy);
            this.setPositionNearWormhole(toSystemId, galaxy);
        }
    }

    /**
    * action.subject.type = "ship"
    * action.subject.id = shipId
    * action.subject.playerId = 1
    * action.verb = "discover"
    * action.object.type = "wormhole"
    * action.object.id = wormholeId
    */
    async discoverSystem(wormholeId) {
        const discoverAction = {
            subject: { type: 'ship', id: this.id, playerId: 1 },
            verb: 'discover',
            object: { type: 'wormhole', id: wormholeId }
        };
        this.actions.push(discoverAction);
    }

    /**
     *
     * @param {*} systemId
     * @param {Galaxy} galaxy
     */
    pushToSystem(systemId, galaxy) {
        const system = galaxy.getSystem(systemId);
        this.previousSystemId = this.systemId;
        this.systemId = systemId;
        system.addEntity(this);
    }

    /**
     *
     * @param {*} systemId
     * @param {Galaxy} galaxy
     */
    setPositionNearWormhole(systemId, galaxy) {
        const destSystem = galaxy.getSystem(systemId);
        const wormhole = destSystem.getWormholeTo(this.previousSystemId);
        this.position.x = wormhole.position.x + getRandomNum(-2, 2, 2);
        this.position.y = wormhole.position.y + getRandomNum(-2, 2, 2);
        this.position.z = wormhole.position.z + 1;
    }

    moveToDestinationPoint(deltaTime) {
        // TODO: moves slower when fps is low?
        if (!this.destinationPoint) { return; }

        const positionVector = new THREE.Vector3().copy(this.object3d.position);
        const destinationVector = new THREE.Vector3().copy(this.destinationPoint);
        const distanceFromDest = positionVector.distanceTo(destinationVector);
        const speedMultiplier = this.speed * deltaTime * 60;

        // If the destinationPoint is within [speed] units away from this.position,
        // then move to destination and set destinationPoint to null
        if (distanceFromDest <= speedMultiplier) {
            this.object3d.position.copy(destinationVector);
            this.destinationPoint = null;
            this.destinationEntity = null;
        } else {
            if (!this.controllered) {
                this.object3d.lookAt(destinationVector);
            }
            const displacementVector = destinationVector
                .sub(positionVector)
                .normalize()
                .multiplyScalar(speedMultiplier, speedMultiplier, speedMultiplier);
            const finalVector = positionVector.add(displacementVector);
            this.object3d.position.copy(finalVector);
            this.synchronizeEntityWithObj3d();
        }
    }

    /**
     * Updates the point that the ship is moving towards because the
     * destination entity may have moved.
     */
    recalculateDestinationPoint(destinationEntity) {
        if (!destinationEntity) return;

        const destX = destinationEntity.object3d.position.x;
        const destY = destinationEntity.object3d.position.y;
        let destZ = destinationEntity.object3d.position.z;

        // put ship in front of stars and planets so they can be seen
        if (['star', 'planet'].includes(destinationEntity.type)) {
            destZ += destinationEntity.object3d.scale.z * 2;
        }

        this.destinationPoint = { "x": destX, "y": destY, "z": destZ };
    }

    handleColonizing(deltaTime, galaxy) {
        // don't start colonization animation until ship is close enough to planet
        if (this.destinationEntity || !this.colonizeTarget) return;
        console.log('handleColonizing')

        // rotate to land on planet
        // 0, 0, 0, points to planet
        this.object3d.rotation.set(0, 0, 0);
        // update animation progress
        // TODO: depend on deltaTime
        this.colonizeAnimationProgress += this.speed * 3 / 9;
        // delete ship once landing animation finished
        if (this.colonizeAnimationProgress >= 1) {
            const colonizeAction = {
                subject: { type: 'ship', id: this.id, playerId: 1 },
                verb: 'colonize',
                object: { type: 'planet', id: this.colonizeTarget.id }
            };
            this.actions.push(colonizeAction);
            this.removeObject3d();
            this.removeFromSystem(galaxy);
        } else {
            // get planet's current coordinates
            const destX = this.colonizeTarget.object3d.position.x;
            const destY = this.colonizeTarget.object3d.position.y;
            // slowly descend in z direction
            let destZ = this.colonizeTarget.object3d.position.z +
                this.colonizeTarget.object3d.scale.z * (2 - this.colonizeAnimationProgress);
            this.destinationPoint = { "x": destX, "y": destY, "z": destZ };
            // shrink ship
            const size = this.size * (1 - this.colonizeAnimationProgress);
            this.object3d.scale.set(size, size, size);
        }
    }

    handleOrbiting(elapsedTime) {
        if (!this.orbitTarget || this.destinationPoint) { return; }

        const centerX = this.orbitTarget.object3d.position.x;
        const centerZ = this.orbitTarget.object3d.position.z;
        const centerY = this.orbitTarget.object3d.position.y;
        const orbitDist = this.orbitTarget.object3d.scale.z * 2;

        if (!this.orbitStartTime) {
            this.orbitStartTime = elapsedTime;
            // this.object3d.rotation.x = Math.PI / 4;
            // this.object3d.rotation.z = Math.PI / 8;
            this.object3d.rotation.x = Math.PI / 2;
            this.object3d.rotation.y = -Math.PI / 2;
            this.object3d.rotation.z = Math.PI / 4;
        }

        const startAngle = Math.PI / 2;
        const timeOrbiting = elapsedTime - this.orbitStartTime;
        const orbitSpeed = this.speed / orbitDist * 2 + 0.05;
        const orbitAngle = startAngle + timeOrbiting * orbitSpeed * Math.PI;

        this.object3d.position.x = centerX + orbitDist * Math.cos(orbitAngle);
        this.object3d.position.z = centerZ + orbitDist * Math.sin(orbitAngle);
        this.object3d.position.y = centerY;

        this.object3d.rotateOnAxis(new THREE.Vector3(1, 0, 0), orbitSpeed * Math.PI / 40);

        // angle pi/2 => x = pi/2, y = -pi/2
        // angle pi => x = pi, y = 0
        // x = pi, y = 0
        // this.object3d.rotation.x = orbitAngle;
        // this.object3d.rotation.y = orbitAngle - Math.PI;
    }

    synchronizeEntityWithObj3d() {
        this.position = {
            x: this.object3d.position.x,
            y: this.object3d.position.y,
            z: this.object3d.position.z
        };
        this.rotation = {
            x: this.object3d.rotation.x,
            y: this.object3d.rotation.y,
            z: this.object3d.rotation.z
        };
    }

    resetObj3dRotation() {
        if (this.controllered) {
            return;
        }
        this.object3d.position = {
            x: this.defaultRotation.x,
            y: this.defaultRotation.y,
            z: this.defaultRotation.z
        };
    }

    getConsoleHtml() {
        let html = '';
        html += this.returnConsoleTitle();
        // control buttons
        if (this.playerId == 1) {
            html += `<div>
                <button id="move" onclick="handleTargetButton('move')">Move</button>
                <button id="orbit" onclick="handleTargetButton('orbit')">Orbit</button>
                <button id="colonize" onclick="handleTargetButton('colonize')">Colonize</button>
                </div>`;
        }
        html += this.consoleBody;
        return html;
    }

}
