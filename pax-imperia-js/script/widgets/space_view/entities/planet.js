import { Entity } from './entity.js'
import * as THREE from 'three';

export class Planet extends Entity {
    constructor(data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'planet';
        this.name = systemName + " " + (this.index + 1);
        // this.assetPath = this.basePath + "/assets/planets/" + this.atmosphere + ".gltf";
        this.assetPath = this.basePath + "/assets/orbitals/meshes/planetbasemodel.glb";
        this.texturePath = this.basePath + "/assets/orbitals/textures/earthlike/" + this.atmosphere + ".png";
        this.cloudMeshPath = this.basePath + "/assets/orbitals/meshes/cloudlayer.glb";
        this.cloudTexturePath = this.basePath + "/assets/orbitals/textures/clouds/" + this.cloud_type + ".png";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/oxygen_thumbnail.png";
        this.position = { x: 0, y: 0, z: 2 * this.distance_from_star };
        this.consoleBody = `
            <div>Mediocre (x2)</div>
            <div>Population: 7/8</div>
            <div>Habitability: :)</div>
            `;
        this.object3ds = [];
    }

    toJSON() {
        return ({
            index: this.index,
            atmosphere: this.atmosphere,
            cloud_type: this.cloud_type,
            size: this.size,
            distance_from_star: this.distance_from_star,
            spin_speed: this.spin_speed,
            starting_angle: this.starting_angle
        });
    }

    update(elapsedTime) {

        this.object3ds.forEach(obj3d => {
            // update rotation
            // negative for rotating counter-clockwise
            const spinImprover = obj3d.isClouds ? 2 : 1;
            obj3d.rotation.y = -0.3 * this.spin_speed * spinImprover * elapsedTime;

            // update revolution
            // speed is determined by distance from star without randomness
            const speedMultiplier = 3;
            const d = this.distance_from_star;
            // square of the planet's orbital period is proportional to the cube of its semimajor axis
            // pow(d, 3) = pow(period, 2), velocity = pow(1/d, 0.5), Math.pow(1/d, 0.5)

            let angle = elapsedTime * Math.pow(speedMultiplier / d, 2) + this.starting_angle;
            obj3d.position.x = d * Math.cos(angle);
            obj3d.position.z = d * Math.sin(angle);
        });

    }

    async load(scene) {
        this.scene = scene;

        ///////////////////////////
        // Load the surface mesh //
        ///////////////////////////

        const object3d = await this.loadMesh(scene, this.assetPath);
        this.loadTexture(object3d, this.texturePath, false, 0.9);
        this.object3d = object3d;
        this.object3ds.push(object3d);

        /////////////////////////
        // Load the cloud mesh //
        /////////////////////////

        const clouds = await this.loadMesh(scene, this.cloudMeshPath);
        this.loadTexture(clouds, this.cloudTexturePath, true, 0.9);
        clouds.isClouds = true;
        clouds.notClickable = true;
        this.object3ds.push(clouds);

    }

    async loadMesh(scene, assetPath) {
        const object3d = await this.loadObject3d(scene, assetPath);

        const material = new THREE.MeshStandardMaterial();
        material.roughness = 0.9;
        material.metalness = 0.1;
        material.color = new THREE.Color(0x9999cc);

        material.needsUpdate = true;
        object3d.children[0].material = material;

        this.setLoadAttributes(object3d);

        // make sure that object3d can link back to the entity
        object3d.parentEntity = this;
        return object3d;
    }

}
