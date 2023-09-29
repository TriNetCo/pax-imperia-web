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
        // load the surface
        const primary = await this.loadPrimary(scene)
        this.addMeshStandardMaterial(primary)
        this.loadTexture(primary, this.texturePath, false, 0.9);
        this.object3ds.push(primary);

        // load the clouds
        const clouds = await this.loadObject3d(scene, this.cloudMeshPath);
        this.loadTexture(clouds, this.cloudTexturePath, true, 0.9);
        this.setLoadAttributes(clouds);
        clouds.isClouds = true;
        clouds.notClickable = true;
        this.object3ds.push(clouds);

        return [primary, clouds];
    }

    addMeshStandardMaterial(object3d) {
        const material = new THREE.MeshStandardMaterial();
        material.roughness = 0.9;
        material.metalness = 0.1;
        material.color = new THREE.Color(0x9999cc);
        material.needsUpdate = true;
        object3d.children[0].material = material;
    }

}
