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

        this.jumbleCorona(this.coronaObject3d1, elapsedTime, 0.5, 0.15, 0.15);
        // this.jumbleCorona(this.coronaObject3d2, elapsedTime, -1, 0.15, 0.1);
        // this.jumbleCorona(this.coronaObject3d3, elapsedTime, 1.5, 0.25, 0.2);
        this.coronaObject3d2.material.rotation = -rotation * 0.75;
        this.coronaObject3d3.material.rotation = rotation * 1;

        //this.coronaObject3d2.material.rotation = -rotation * 2 / 2;
        //this.coronaObject3d3.material.rotation = rotation * 3 / 2;
        //this.coronaObject3d4.material.rotation = -rotation * 4;

    }

    jumbleCorona(object3d, elapsedTime, rotationSpeed, sinAmplitude, cosAmplitude) {
        object3d.material.rotation = elapsedTime * rotationSpeed;
        const angle = elapsedTime * rotationSpeed
        object3d.position.x = Math.sin(angle) * sinAmplitude;
        object3d.position.y = Math.cos(1.7 * angle) * cosAmplitude;
    }

    async load(scene) {
        this.scene = scene;

        // create star surface
        const object3d = await this.loadMesh(scene, this.assetPath);
        this.addBrightenerMaterial(object3d);
        this.loadTexture(object3d, this.texturePath, false, 1);
        this.setLoadAttributes(object3d);
        this.object3d = object3d;

        // create corona
        this.coronaObject3d1 = await this.createCorona(scene);
        this.coronaObject3d2 = await this.createCorona(scene);
        this.coronaObject3d3 = await this.createCorona(scene);
    }

    async createCorona(scene) {
        const coronaPath = this.basePath + "/assets/orbitals/textures/sun/corona/corona.png";
        const coronaObject3d = await this.loadBillboard(scene, coronaPath);
        this.setLoadAttributes(coronaObject3d);
        const coronaScale = this.scale.x * 2.4;
        coronaObject3d.scale.set(coronaScale, coronaScale, coronaScale);
        coronaObject3d.notClickable = true;
        return coronaObject3d;
    }

    async loadMesh(scene, assetPath) {
        const object3d = await this.loadObject3d(scene, assetPath);

        // make sure that object3d can link back to the entity
        object3d.parentEntity = this;

        return object3d;
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
