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
        console.log("loading " + this.type + ": " + this.name);
        let object3d = await this.loadObject3d(scene,
            this.name,
            this.assetPath,
            this.scale,
            this.position,
            this.rotation,
        );

        if (this.type === 'star') {
            let texture = object3d.children[0].material.map;
            object3d.children[0].material = new THREE.MeshBasicMaterial();
            object3d.children[0].material.map = texture;
        }

        // make sure that object3d can link back to the entity
        object3d.parentEntity = this;
        this.object3d = object3d;
    }

    async loadObject3d(scene,
        name,
        assetPath,
        scale = { x: 1, y: 1, z: 1 },
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 }) {
        let assetPathSplit = assetPath.split(".")
        let fileExt = assetPathSplit[assetPathSplit.length - 1]
        let loader;
        if (fileExt == 'gltf') {
            loader = new GLTFLoader();
        } else if (fileExt == 'fbx') {
            loader = new FBXLoader();
        }
        let object3d = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (input) {
                let obj;
                if (fileExt == 'gltf') {
                    obj = input.scene;
                } else if (fileExt == 'fbx') {
                    obj = input;
                }
                obj.position.set(position.x, position.y, position.z);
                obj.rotation.set(rotation.x, rotation.y, rotation.z); // x, y, z radians
                obj.scale.set(scale.x, scale.y, scale.z);
                obj.name = name;
                obj.children[0].name = name;
                scene.add(obj);
                // console.log("Finished loading!");
                resolve(obj);
            }, function (xhr) {
                // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
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
        const systemEntities = galaxy.systems[this.systemId][this.type + 's']
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
