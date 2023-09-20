import { Entity } from './entity.js';
import { roundToDecimal, getRandomNum } from '../../../models/helpers.js';
import * as THREE from 'three';

export class Ship extends Entity {
    constructor (data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'ship';
        this.assetPath = this.basePath + '/assets/ships/GalacticLeopard6.fbx';
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/ship_thumbnail.png";
        this.size = 0.00015;
        this.scale = {x: this.size, y: this.size, z: this.size};
        this.rotation = {x: 0.7, y: -1.6, z: 0.4};
        this.speed = 0.2;
        this.previousSystemId = typeof this.previousSystemId === 'undefined' ? null : this.previousSystemId;
        this.buttonState = null;
        // movement animation attributes
        this.destinationPoint = null; // x, y, z coordinates
        this.destinationTarget = null; // 3d object
        this.orbitTarget = null; // 3d object
        this.orbitAngle = null; // radians
        this.colonizeTarget = null; // 3d object
        this.colonizeAnimationProgress = null; // 0 to 1
    }

    toJSON() {
        return ({
            name: this.name,
            index: this.index,
            position: this.position,
        });
    }

    update (deltaTime, system, galaxy) {
        // first, check if ship should be sent through wormhole
        if (this.destinationTarget &&
            this.destinationTarget.parentEntity.type == 'wormhole') {
                this.checkAndSendThroughWormhole(galaxy);
        }
        // then, update destination point if moving to a target or colonizing
        if (this.destinationTarget) {
            // set destination point to current coordinates
            this.updateTargetDestinationPoint();
        } else if (this.colonizeTarget) {
            this.updateColonize(system);
        }
        // finally, move to destination point or update orbit
        if (this.destinationPoint) {
            this.updateToDestinationPoint();
        } else if (this.orbitTarget) {
            this.updateOrbit(deltaTime);
        }
        this.updateConsoleBody();
    };

    updateConsoleBody () {
        const previousConsoleBody = this.consoleBody;
        this.consoleBody = '<div>';
        if (this.destinationTarget) {
            this.consoleBody += 'Destination: ' + this.destinationTarget.parentEntity.name + ' ' + this.destinationTarget.parentEntity.type;
        } else if (this.destinationPoint) {
            this.consoleBody += 'Destination: ' + roundToDecimal(this.destinationPoint.x, 2) + ", " +
                roundToDecimal(this.destinationPoint.y, 2) + ", " +
                roundToDecimal(this.destinationPoint.z, 2);
        } else if (this.orbitTarget) {
            this.consoleBody += 'Orbiting: ' + this.orbitTarget.parentEntity.name + ' ' + this.orbitTarget.parentEntity.type;
        }
        this.consoleBody += '</div>';
        if (previousConsoleBody != this.consoleBody) {
            window.spaceViewDomManager.populateHtml();
        }
    }

    resetMovement() {
        this.destinationPoint = null;
        this.destinationTarget = null;
        this.orbitTarget = null;
        this.orbitAngle = null;
        this.colonizeTarget = null;
        this.colonizeAnimationProgress = null;
    }

    checkAndSendThroughWormhole(galaxy) {
        // if ship is close enough to wormhole, move it to the next system
        const distanceFromDest = this.object3d.position.distanceTo(
            this.destinationTarget.position);
        const wormholeId = this.destinationTarget.parentEntity.id;
        if (distanceFromDest <= this.speed) {
            // copy ship data to wormhole system data
            this.resetMovement();
            this.removeObject3d();
            // delete ship from current system
            this.removeFromSystem(galaxy);
            // move to new system
            this.pushToSystem(wormholeId, galaxy);
            this.setPositionNearWormhole(wormholeId, galaxy);
        }
    }

    pushToSystem(systemId, galaxy) {
        // create entity in systemsData
        const system = galaxy.systems[systemId];
        // update with new systemId
        this.previousSystemId = this.systemId;
        this.systemId = systemId;
        system[this.type + 's'].push(this);
    }

    setPositionNearWormhole(wormholeId, galaxy) {
        const destSystem = galaxy.systems[wormholeId];
        const wormhole = destSystem.wormholes.find(x => x.id === this.previousSystemId);
        this.position.x = wormhole.position.x + getRandomNum(-2, 2, 2);
        this.position.y = wormhole.position.y + getRandomNum(-2, 2, 2);
        this.position.z = wormhole.position.z + 1;
    }

    updateToDestinationPoint() {
        const positionVector = new THREE.Vector3().copy(this.object3d.position);
        const destinationVector = new THREE.Vector3().copy(this.destinationPoint);
        const distanceFromDest = positionVector.distanceTo(destinationVector);

        // If the destinationPoint is within [speed] units away from this.position,
        // then move to destination and set destinationPoint to null
        if (distanceFromDest <= this.speed) {
            this.object3d.position.copy(destinationVector);
            this.destinationPoint = null;
            this.destinationTarget = null;
        } else {
            const displacementVector = destinationVector
                .sub(positionVector)
                .normalize()
                .multiplyScalar(this.speed, this.speed, this.speed);
            const finalVector = positionVector.add(displacementVector);
            this.object3d.position.copy(finalVector);
        }
    }

    updateTargetDestinationPoint() {
        const destX = this.destinationTarget.position.x;
        const destY = this.destinationTarget.position.y;
        let destZ = this.destinationTarget.position.z;
        // put ship in front of stars and planets so they can be seen
        if (['star', 'planet'].includes(this.destinationTarget.parentEntity.type)){
            destZ += this.destinationTarget.scale.z*2;
            // this.orbitTarget = this.destinationTarget;
        }
        this.destinationPoint = {"x": destX, "y": destY, "z": destZ};
    }

    updateColonize() {
        // update animation progress
        this.colonizeAnimationProgress += this.speed/20;
        // delete ship once landing animation finished
        if (this.colonizeAnimationProgress >= 1) {
            this.removeObject3d();
            this.removeFromSystem(galaxy)
            return
        }
        // get planet's current coordinates
        const destX = this.colonizeTarget.position.x;
        const destY = this.colonizeTarget.position.y;
        // slowly descend in z direction
        let destZ = this.colonizeTarget.position.z +
            this.colonizeTarget.scale.z * (2 - this.colonizeAnimationProgress);
        this.destinationPoint = {"x": destX, "y": destY, "z": destZ};
        // shrink ship
        const size = this.size * (1 - this.colonizeAnimationProgress);
        this.object3d.scale.set(size, size, size);
    }

    updateOrbit() {
        const centerX = this.orbitTarget.position.x;
        const centerZ = this.orbitTarget.position.z;
        const centerY = this.orbitTarget.position.y;
        const orbitDist = this.orbitTarget.scale.z*2

        if (!this.orbitAngle) {
            this.orbitAngle = Math.PI/2;
        }
        this.orbitAngle += this.speed/32 * Math.PI;

        this.object3d.position.x = centerX + orbitDist * Math.cos(this.orbitAngle);
        this.object3d.position.z = centerZ + orbitDist * Math.sin(this.orbitAngle);
        this.object3d.position.y = centerY;
    }

    returnConsoleHtml() {
        let html = '';
        html += this.returnConsoleTitle();
        html += `<div>
            <button id="move" onclick="handleTargetButton('move')">Move</button>
            <button id="orbit" onclick="handleTargetButton('orbit')">Orbit</button>
            <button id="colonize" onclick="handleTargetButton('colonize')">Colonize</button>
            </div>`;
        html += this.consoleBody;
        return html;
    }

}
