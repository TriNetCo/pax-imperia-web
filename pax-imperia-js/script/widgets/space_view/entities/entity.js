import * as THREE from 'three';

import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from '/node_modules/three/examples/jsm/loaders/FBXLoader.js';

// import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/GLTFLoader.js";
// import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/FBXLoader.js";

import { packData, unpackData } from '../../../models/helpers.js'

export class Entity {
    constructor (data, systemName = "", systemId) {
        this.type = "";
        this.size = 1;
        this.position = {x: 0, y: 0, z: 0};
        this.rotation = {x: 0, y: 0, z: 0};
        this.systemId = systemId;
        this.data = data;
        this.consoleBody = '';
        unpackData(data, this);
        this.scale = {x: this.size, y: this.size, z: this.size};
        this.basePath = window.location.hash.includes("#") ? "/pax-imperia-clone" : ""
    }

    async load (scene) {
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

    async loadObject3d (scene,
                        name,
                        assetPath,
                        scale = {x: 1, y: 1, z: 1},
                        position = {x: 0, y: 0, z: 0},
                        rotation = {x: 0, y: 0, z: 0}) {
        let assetPathSplit = assetPath.split(".")
        let fileExt = assetPathSplit[assetPathSplit.length - 1]
        let loader;
        if (fileExt == 'gltf') {
            loader = new GLTFLoader();
        } else if (fileExt == 'fbx') {
            loader = new FBXLoader();
        }
        let object3d = new Promise(function(resolve, reject) {
            loader.load(assetPath, function ( input ) {
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
                scene.add( obj );
                // console.log("Finished loading!");
                resolve(obj);
            }, function ( xhr ) {
                // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            }, function ( error ) {
                console.error( error );
            } );

        });
        return object3d;
    }

    delete(system) {
        this.deleteObject3d();
        this.deleteEntity(system);
        this.deleteData();
    }

    deleteObject3d() {
        // unselect if selected object is being deleted
        if (window.spaceViewDomManager.selectionSprite.selectionTarget == this.object3d) {
            window.spaceViewDomManager.selectionSprite.unselect()
        }
        // delete 3d object from scene
        this.scene.remove(this.object3d);
    }

    deleteEntity(system) {
        // delete entity from system
        const i = system[this.type + 's'].findIndex(x => x.name === this.name);
        system[this.type + 's'].splice(i, 1);
        // update sidebar
        window.spaceViewDomManager.populateHtml();
    }

    deleteData() {
        // delete from systemData
        const systemData = window.systemsData[this.systemId];
        const i = systemData[this.type + 's'].findIndex(x => x.name === this.name);
        systemData[this.type + 's'].splice(i, 1);
    }

    pushData(systemId) {
        // create entity in systemsData
        const systemData = window.systemsData[systemId];
        let entityData = packData(this);
        // update with new systemId
        entityData.previousSystemId = entityData.systemId;
        entityData.systemId = systemId;
        systemData[this.type + 's'].push(entityData);
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
