import { Entity } from './entity.js'
import * as THREE from 'three';

export class Ship extends Entity {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'ship';
        this.name = "ship";
        this.assetPath = '/assets/ships/GalacticLeopard6.fbx';
        this.assetThumbnailPath = "/assets/thumbnails/ship_thumbnail.png";
        this.size = 0.0002;
        this.scale = {x: this.size, y: this.size, z: this.size};
        this.position = {x: -1.5, y: 2.6, z: 6};
        // this.rotation = {x: 2* Math.PI, y: 1.5708, z: 2*Math.PI/4};
        this.rotation = {x: 0.7, y: -1.6, z: 0.4};
        this.speed = 0.2;
        this.destinationPoint = null;
    }

    update (deltaTime) {
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
