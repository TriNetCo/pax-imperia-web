import Entity from './entity.js'
import * as THREE from 'three';
import { getBasePath } from '../../../models/helpers.js';

export class Star extends Entity {

    constructor(data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'star';
        this.name = systemName;
        this.assetPath = "/assets/orbitals/meshes/planetbasemodel.glb";
        this.texturePath = "/assets/orbitals/textures/sun/yellow/YellowSun0001.png";
        this.assetThumbnailPath = getBasePath() + "/assets/thumbnails/sun_thumbnail.png";
    }

    update(elapsedTime) {
        if (!this.object3d || !this.object3ds?.corona3) {
            console.log('early star update')
            return
        }
        // rotate star
        this.object3d.rotation.copy(this.getRotation(elapsedTime));

        // rotate coronas
        const rotation = 0.3 * this.spin_speed * elapsedTime;
        this.jumbleCorona(this.object3ds.corona1, elapsedTime, 1, 0.05, 0.05);
        this.object3ds.corona2.material.rotation = -rotation * 0.75;
        this.object3ds.corona3.material.rotation = rotation * 0.5;
    }

    getPosition(elapsedTime) {
        return new THREE.Vector3(0, 0, 0);
    }

    getRotation(elapsedTime) {
        const rotation = 0.3 * this.spin_speed * elapsedTime;
        return new THREE.Euler(rotation, rotation, 0);
    }

    jumbleCorona(object3d, elapsedTime, rotationSpeed, sinAmplitude, cosAmplitude) {
        object3d.material.rotation = elapsedTime * rotationSpeed;
        const angle = elapsedTime * rotationSpeed;
        object3d.position.x = Math.sin(angle) * sinAmplitude;
        object3d.position.y = Math.cos(1.7 * angle) * cosAmplitude;
    }

}
