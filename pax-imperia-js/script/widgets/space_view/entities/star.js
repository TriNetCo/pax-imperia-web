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

    async load(scene) {
        // create star surface
        const primary = await this.loadPrimary(scene);
        this.addBrightenerMaterial(this.object3d);
        this.loadTexture(this.object3d, this.texturePath, false, 1);
        this.setLoadAttributes(this.object3d);

        // create coronas
        const corona = await this.createCorona(scene);
        this.coronaObject3ds = [corona, corona.clone(), corona.clone()];
        return [primary, ...this.coronaObject3ds]
        // scene.add(this.coronaObject3ds[0]);
        // scene.add(this.coronaObject3ds[1]);
        // scene.add(this.coronaObject3ds[2]);
    }

    async createCorona(scene) {
        const coronaPath = this.basePath + "/assets/orbitals/textures/sun/corona/corona.png";
        const corona = await this.loadBillboard(scene, coronaPath);
        this.setLoadAttributes(corona);
        const coronaScale = this.scale.x * 2.4;
        corona.scale.set(coronaScale, coronaScale, coronaScale);
        corona.notClickable = true;
        return corona;
    }

    // This makes it so the star doesn't have a shadow and is always lit
    addBrightenerMaterial(object3d) {
        const firstChild = object3d.children[0];
        let texture = firstChild.material.map;
        firstChild.material = new THREE.MeshBasicMaterial();
        firstChild.material.map = texture;
        firstChild.material.needsUpdate = true;
    }

}
