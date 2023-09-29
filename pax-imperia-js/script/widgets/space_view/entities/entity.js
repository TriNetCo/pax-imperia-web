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

    ///////////////////////////
    // Load Object3d Methods //
    ///////////////////////////

    async load(scene) {
        const primary = await this.loadPrimary(scene);
        return primary;
    }

    async loadPrimary(scene) {
        this.scene = scene;
        const object3d = await this.loadObject3d(
            scene,
            this.assetPath,
        );

        if (this.texturePath) {
            this.loadTexture(object3d, this.texturePath, false);
        }

        this.setLoadAttributes(object3d);

        // object3d can call parent entity
        // and parent entity can call object3d
        object3d.parentEntity = this;
        this.object3d = object3d;
        return object3d;
    }

    async loadObject3d(scene, assetPath) {
        const assetPathSplit = assetPath.split(".");
        const fileExt = assetPathSplit[assetPathSplit.length - 1];
        switch (fileExt) {
            case 'gltf':
            case 'glb':
                return await this.loadGltf(scene, assetPath);
            case 'fbx':
                return await this.loadFbx(scene, assetPath);
            case 'png':
                return await this.loadBillboard(scene, assetPath);
            default:
                console.log('unknown file type')
        }
    }

    async loadGltf(scene, assetPath) {
        const loader = new GLTFLoader();
        const object3d = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (input) {
                const obj = input.scene;
                //scene.add(obj);
                resolve(obj);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
            });
        });
        return object3d;
    }

    async loadFbx(scene, assetPath) {
        const loader = new FBXLoader();
        const object3d = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (input) {
                const obj = input;
                //scene.add(obj);
                resolve(obj);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
            });
        });
        return object3d;
    }

    async loadBillboard(scene, assetPath) {
        const loader = new THREE.TextureLoader();
        const object3d = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (input) {
                const spriteMaterial = new THREE.SpriteMaterial({ map: input });
                const obj = new THREE.Sprite(spriteMaterial);
                //scene.add(obj);
                resolve(obj);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
            });
        });
        return object3d;
    }

    loadTexture(object3d, texturePath, transparent = false, roughness = 0.9) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(texturePath, function (texture) {
            // fixes Blender export bug
            texture.flipY = false;

            object3d.traverse(function (child) {
                if (child.isMesh) {
                    // cloud settings
                    if (transparent) {
                        child.material.alphaMap = texture;
                        child.material.alphaTest = 0.1;
                        child.material.transparent = true;
                    } else {
                        child.material.map = texture;
                    }
                    child.material.roughness = roughness;
                    child.material.needsUpdate = true;
                }
            });
        });
    }

    setLoadAttributes(object3d) {
        object3d.position.set(this.position.x, this.position.y, this.position.z);
        // rotation is in radians
        object3d.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        object3d.scale.set(this.scale.x, this.scale.y, this.scale.z);
        object3d.name = this.name;
        if (object3d.children[0]) {
            object3d.children[0].name = this.name;
        }
    }

    /////////////////////////////////
    // Unselect and Remove Methods //
    /////////////////////////////////

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
        const systemEntities = galaxy.systems[this.systemId][this.type + 's']
        const i = systemEntities.findIndex(x => x.name === this.name);
        // remove from list of entities in system
        systemEntities.splice(i, 1);
        // update sidebar
        window.spaceViewDomManager.populateHtml();
    }

    /////////////////////
    // Console Methods //
    /////////////////////

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
