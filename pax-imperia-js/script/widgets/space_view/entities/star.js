import { Entity } from './entity.js'
import * as THREE from 'three';

export class Star extends Entity {
    constructor(data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'star';
        this.name = systemName;
        this.assetPath = this.basePath + "/assets/planets/sun.gltf";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/sun_thumbnail.png";
    }

    update(elapsedTime) {
        const rotation = 0.3 * this.spin_speed * elapsedTime;
        this.object3d.rotation.y = rotation;
        this.object3d.rotation.x = rotation;
    }

    async load(scene) {
        this.scene = scene;

        const modelPath = this.basePath + "/assets/orbitals/meshes/planetbasemodel.glb";
        const texturePath = this.basePath + "/assets/orbitals/textures/sun/yellow/YellowSun0001.png";
        const object3d = await this.loadMesh(scene, modelPath);
        this.addBrightenerMaterial(object3d);

        this.loadTexture(object3d, texturePath);
        this.setLoadAttributes(object3d);

        this.object3d = object3d;
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

    loadTexture(object3d, texturePath, transparent = false) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(texturePath, function(texture) {
            texture.flipY = false;

            object3d.traverse(function(child) {
                if (child.isMesh) {
                    const material = child.material;
                    material.map = texture;
                    material.roughness = 1;
                    material.needsUpdate = true;
                }
            });
        });
    }

}
