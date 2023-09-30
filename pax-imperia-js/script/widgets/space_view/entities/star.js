import { Entity } from './entity.js'
import * as THREE from 'three';

export class Star extends Entity {
    constructor(data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'star';
        this.name = systemName;
        // this.assetPath = this.basePath + "/assets/planets/sun.gltf";
        this.assetPath = this.basePath + "/assets/orbitals/meshes/planetbasemodel.glb";
        this.texturePath = this.basePath + "/assets/orbitals/textures/sun/yellow/YellowSun0001.png";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/sun_thumbnail.png";
    }

    update(elapsedTime) {
        if (!this.object3d || !this.coronaObject3ds) {
            console.log('early star update')
            return
        }
        // rotate star surface
        const rotation = 0.3 * this.spin_speed * elapsedTime;
        this.object3d.rotation.y = rotation;
        this.object3d.rotation.x = rotation;

        // rotate coronas
        this.jumbleCorona(this.coronaObject3ds[0], elapsedTime, 1, 0.15, 0.15);
        this.coronaObject3ds[1].material.rotation = -rotation * 0.75;
        this.coronaObject3ds[2].material.rotation = rotation * 0.5;
    }

    jumbleCorona(object3d, elapsedTime, rotationSpeed, sinAmplitude, cosAmplitude) {
        object3d.material.rotation = elapsedTime * rotationSpeed;
        const angle = elapsedTime * rotationSpeed;
        object3d.position.x = Math.sin(angle) * sinAmplitude;
        object3d.position.y = Math.cos(1.7 * angle) * cosAmplitude;
    }

}
