import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { packData, unpackData } from '../../../models/helpers.js'

export class Entity {
    constructor(data, systemName = "", systemId) {
        this.type = "";
        this.size = 1;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.systemId = systemId;
        this.data = data;
        this.consoleBody = '';
        unpackData(data, this);
        this.scale = { x: this.size, y: this.size, z: this.size };
        this.basePath = '';
        if (typeof (window) !== 'undefined' && window.location.hash.includes("#")) {
            this.basePath = "/pax-imperia-clone";
        }
    }

    toJSON() {
        return ({
            index: this.index,
            atmosphere: this.atmosphere,
            size: this.size,
            distance_from_star: this.distance_from_star,
            spin_speed: this.spin_speed,
            starting_angle: this.starting_angle
        });
    }

    async load(scene) {
        this.scene = scene;
        // console.log("loading " + this.type + ": " + this.name);
        let object3d = await this.loadObject3d(
            scene,
            this.assetPath,
        );

        if (this.type === 'star') {
            let texture = object3d.children[0].material.map;
            object3d.children[0].material = new THREE.MeshBasicMaterial();
            object3d.children[0].material.map = texture;
        }

        if (this.type === 'planet') {
            let texture = object3d.children[0].material.map;
            object3d.children[0].material = new THREE.MeshStandardMaterial();
            object3d.children[0].material.map = texture;
            object3d.children[0].material.metalness = 0;
            object3d.children[0].material.roughness = 0.6;
        }

        this.loadTexture(object3d);
        this.setLoadAttributes(object3d);

        // make sure that object3d can link back to the entity
        object3d.parentEntity = this;
        this.object3d = object3d;
    }

    loadTexture(object3d) {
        if (this.texturePath) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(this.texturePath, function (texture) {
                texture.flipY = false;

                object3d.traverse(function (child) {
                    if (child.isMesh) {
                        child.material.map = texture;
                        child.material.needsUpdate = true;
                    }
                });
            });
        }
    }

    setLoadAttributes(object3d) {
        object3d.position.set(this.position.x, this.position.y, this.position.z);
        object3d.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z); // x, y, z radians
        object3d.scale.set(this.scale.x, this.scale.y, this.scale.z);
        object3d.name = this.name;
        object3d.children[0].name = this.name;
    }

    async loadObject3d(scene, assetPath) {
        const assetPathSplit = assetPath.split(".");
        const fileExt = assetPathSplit[assetPathSplit.length - 1];
        let loader;
        if (fileExt == 'gltf' || fileExt == 'glb') {
            loader = new GLTFLoader();
        } else if (fileExt == 'fbx') {
            loader = new FBXLoader();
        }
        const object3d = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (input) {
                let obj;
                if (fileExt == 'gltf' || fileExt == 'glb') {
                    obj = input.scene;
                } else if (fileExt == 'fbx') {
                    obj = input;
                }
                scene.add(obj);
                resolve(obj);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
            });

        });
        return object3d;
    }

    unselect() {
        // TODO: remove spaceViewDomManager global
        if (window.spaceViewDomManager.selectionSprite.selectionTarget == this.object3d) {
            window.spaceViewDomManager.unselectTarget();
        }
    }

    removeObject3d() {
        this.unselect()
        // delete 3d object from scene
        this.scene.remove(this.object3d);
    }

    removeFromSystem(galaxy) {
        // delete entity from system object
        // find index of entity in list of entities in system
        const systemEntities = galaxy.returnSystemById(this.systemId)[this.type + 's']
        const i = systemEntities.findIndex(x => x.name === this.name);
        // remove from list of entities in system
        systemEntities.splice(i, 1);
        // update sidebar
        window.spaceViewDomManager.populateHtml();
    }

    returnConsoleTitle() {
        return '<div>' + this.type.toUpperCase() + ': ' + this.name + '</div>';
    }

    returnConsoleHtml() {
        let html = '';
        html += this.returnConsoleTitle();
        html += this.consoleBody;
        return html;
    }
}
