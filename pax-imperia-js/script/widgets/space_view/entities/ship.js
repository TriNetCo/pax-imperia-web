import { Entity } from './entity.js'
import * as THREE from 'three';

export class Ship extends Entity {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'ship';
        this.assetPath = '/assets/ships/GalacticLeopard6.fbx';
        this.assetThumbnailPath = "/assets/thumbnails/ship_thumbnail.png";
        this.size = 0.0002;
        this.scale = {x: this.size, y: this.size, z: this.size};
        // this.position = {x: -1.5, y: 2.6, z: 6};
        // this.name = "ship";
        this.rotation = {x: 0.7, y: -1.6, z: 0.4};
        this.speed = 0.2;
        this.destinationPoint = null; // x, y, z coordinates
        this.destinationTarget = null; // 3d object
    }

    update (deltaTime, system) {
        if (this.destinationTarget &&
            this.destinationTarget.parentEntity.type == 'wormhole') {
            // if ship is close enough to wormhole, move it to the next system
            const distanceFromDest = this.object3d.position.distanceTo(this.destinationTarget.position);
            if (distanceFromDest <= this.speed) {
                // TODO: send via wormhole
                // selectionTarget.parentEntity.id;
                this.deleteEntity(system);
            }
        }
        if (this.destinationTarget) {
            const destX = this.destinationTarget.position.x;
            const destY = this.destinationTarget.position.y;
            let destZ = this.destinationTarget.position.z;
            // put ship in front of stars and planets so they can be seen
            if (['star', 'planet'].includes(this.destinationTarget.parentEntity.type)){
                destZ += this.destinationTarget.scale.z*2;
            }
            this.destinationPoint = {"x": destX, "y": destY, "z": destZ};
        }
        if (this.destinationPoint) {
            const positionVector = new THREE.Vector3().copy(this.object3d.position);
            const destinationVector = new THREE.Vector3().copy(this.destinationPoint);
            const distanceFromDest = positionVector.distanceTo(destinationVector);

            // If the destinationPoint is within [speed] units away from this.position,
            // then set destinationPoint to null
            if (distanceFromDest <= this.speed) {
                this.object3d.position.copy(destinationVector);
                this.destinationPoint = null;
            } else {
                const displacementVector = destinationVector
                    .sub(positionVector)
                    .normalize()
                    .multiplyScalar(this.speed, this.speed, this.speed);
                const finalVector = positionVector.add(displacementVector);
                this.object3d.position.copy(finalVector);
            }
        }
    }

}
