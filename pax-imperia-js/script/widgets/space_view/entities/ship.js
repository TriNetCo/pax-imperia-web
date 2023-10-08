import Entity from './entity.js';
import { roundToDecimal, getRandomNum } from '../../../models/helpers.js';
import * as THREE from 'three';

export class Ship extends Entity {
    constructor(data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'ship';
        this.assetFolder = '/assets/ships/';

        // this.assetPath = `${this.assetFolder}Meshes/${this.shipMake}/${this.shipMake}${this.shipModel}.fbx`;
        // this.texturePath = `${this.assetFolder}Textures/${this.shipMake}/Standard/${this.shipMake}_White.png`;
        // this.normalMapPath = `${this.assetFolder}Textures/${this.shipMake}/Standard/${this.shipMake}_Normal.png`;
        // this.metallicSmoothnessMapPath = `${this.assetFolder}Textures/${this.shipMake}/Standard/${this.shipMake}_MetallicSmoothness.png`;
        // this.emissionMapPath = `${this.assetFolder}Textures/${this.shipMake}/Standard/${this.shipMake}_Emission2.png`;

        this.assetPath = `${this.assetFolder}Meshes/${this.shipMake}/${this.shipMake}${this.shipModel}.fbx`;
        this.texturePath = `${this.assetFolder}Textures/${this.shipMake}/${this.shipMake}_White.png`;
        this.normalMapPath = `${this.assetFolder}Textures/${this.shipMake}/${this.shipMake}_Normal.png`;
        this.metallicSmoothnessMapPath = `${this.assetFolder}Textures/${this.shipMake}/${this.shipMake}_MetallicSmoothness.png`;
        this.emissionMapPath = `${this.assetFolder}Textures/${this.shipMake}/${this.shipMake}_Emission2.png`;


        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/ship_thumbnail.png";
        this.size = 0.002;
        if (['VoidWhale'].includes(this.shipMake)) {
            this.size = 0.00015;
        } else if (['GalacticLeopard', 'CraizanStar', 'GalacticOkamoto'].includes(this.shipMake)) {
            this.size = 0.0003;
        } else if (['SpaceSphinx'].includes(this.shipMake)) {
            this.size = 0.0005;
        } else if (['StriderOx', 'SpaceExcalibur'].includes(this.shipMake)) {
            this.size = 0.0015;
        }
        this.size = this.size * 1.5;

        this.scale = { x: this.size, y: this.size, z: this.size };
        this.defaultRotation = { x: Math.PI / 4, y: -Math.PI / 2, z: Math.PI / 8 };
        this.rotation = this.defaultRotation;
        this.speed = 0.2;
        this.previousSystemId = typeof this.previousSystemId === 'undefined' ? null : this.previousSystemId;
        this.buttonState = null;
        // movement animation attributes
        this.destinationPoint = null; // x, y, z coordinates
        this.destinationTarget = null; // entity object
        this.orbitTarget = null; // entity object
        this.orbitStartTime = null; // radians
        this.colonizeTarget = null; // entity object
        this.colonizeAnimationProgress = null; // 0 to 1
    }

    toJSON() {
        return ({
            name: this.name,
            index: this.index,
            position: this.position,
            shipMake: this.shipMake,
            shipModel: this.shipModel,
        });
    }

    update(elapsedTime, deltaTime, system, galaxy) {
        // first, check if ship should be sent through wormhole
        if (this.destinationTarget &&
            this.destinationTarget.type == 'wormhole') {
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
            this.updateToDestinationPoint(deltaTime);
        } else if (this.orbitTarget) {
            this.updateOrbit(elapsedTime);
        }
        this.updateConsoleBody();
    };

    updateConsoleBody() {
        const previousConsoleBody = this.consoleBody;
        this.consoleBody = '<div>';
        if (this.destinationTarget) {
            this.consoleBody += 'Destination: ' +
                this.destinationTarget.name + ' ' +
                this.destinationTarget.type;
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
        this.destinationTarget = null;
        this.orbitTarget = null;
        this.orbitStartTime = null;
        this.colonizeTarget = null;
        this.colonizeAnimationProgress = null;
    }

    checkAndSendThroughWormhole(galaxy) {
        // if ship is close enough to wormhole, move it to the next system
        const distanceFromDest = this.object3d.position.distanceTo(
            this.destinationTarget.object3d.position);
        const wormholeId = this.destinationTarget.id;
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

    updateToDestinationPoint(deltaTime) {
        const positionVector = new THREE.Vector3().copy(this.object3d.position);
        const destinationVector = new THREE.Vector3().copy(this.destinationPoint);
        const distanceFromDest = positionVector.distanceTo(destinationVector);
        const speedMultiplier = this.speed * deltaTime * 60;

        // If the destinationPoint is within [speed] units away from this.position,
        // then move to destination and set destinationPoint to null
        if (distanceFromDest <= this.speed) {
            this.object3d.position.copy(destinationVector);
            this.destinationPoint = null;
            this.destinationTarget = null;
        } else {
            this.object3d.lookAt(destinationVector);
            const displacementVector = destinationVector
                .sub(positionVector)
                .normalize()
                .multiplyScalar(speedMultiplier, speedMultiplier, speedMultiplier);
            const finalVector = positionVector.add(displacementVector);
            this.object3d.position.copy(finalVector);
            this.synchronizeEntityWithObj3d();
        }
    }

    updateTargetDestinationPoint() {
        const destX = this.destinationTarget.object3d.position.x;
        const destY = this.destinationTarget.object3d.position.y;
        let destZ = this.destinationTarget.object3d.position.z;
        // put ship in front of stars and planets so they can be seen
        if (['star', 'planet'].includes(this.destinationTarget.type)) {
            destZ += this.destinationTarget.object3d.scale.z * 2;
        }
        this.destinationPoint = { "x": destX, "y": destY, "z": destZ };
    }

    updateColonize() {
        // rotate to land on planet
        // 0, 0, 0, points to planet
        this.object3d.rotation.set(0, 0, 0);
        // update animation progress
        this.colonizeAnimationProgress += this.speed / 20;
        // delete ship once landing animation finished
        if (this.colonizeAnimationProgress >= 1) {
            this.removeObject3d();
            this.removeFromSystem(galaxy)
            return
        }
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

    updateOrbit(elapsedTime) {
        const centerX = this.orbitTarget.object3d.position.x;
        const centerZ = this.orbitTarget.object3d.position.z;
        const centerY = this.orbitTarget.object3d.position.y;
        const orbitDist = this.orbitTarget.object3d.scale.z * 2;

        if (!this.orbitStartTime) {
            this.orbitStartTime = elapsedTime;
            this.object3d.rotation.x = Math.PI / 4;
            this.object3d.rotation.y = -Math.PI / 2;
            this.object3d.rotation.z = Math.PI / 8;
        }

        const startAngle = Math.PI / 2;
        const timeOrbiting = elapsedTime - this.orbitStartTime;
        const orbitSpeed = this.speed / orbitDist * 2 + 0.05;
        const orbitAngle = startAngle + timeOrbiting * orbitSpeed * Math.PI;

        this.object3d.position.x = centerX + orbitDist * Math.cos(orbitAngle);
        this.object3d.position.z = centerZ + orbitDist * Math.sin(orbitAngle);
        this.object3d.position.y = centerY;
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
        this.object3d.position = {
            x: this.defaultRotation.x,
            y: this.defaultRotation.y,
            z: this.defaultRotation.z
        };
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
