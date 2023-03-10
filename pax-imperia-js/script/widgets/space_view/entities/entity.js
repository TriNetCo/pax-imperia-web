import * as THREE from 'three';

import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from '/node_modules/three/examples/jsm/loaders/FBXLoader.js';

// import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/GLTFLoader.js";
// import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/FBXLoader.js";

import { unpackData } from '../../../models/helpers.js'

export class Entity {
    constructor (data, systemName = "") {
        this.type = "";
        this.size = 1;
        this.position = {x: 0, y: 0, z: 0};
        this.rotation = {x: 0, y: 0, z: 0};
        unpackData(data, this);
        this.scale = {x: this.size, y: this.size, z: this.size};
    }

    async load (scene) {
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
                console.log("Finished loading!");
                resolve(obj);
            }, function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            }, function ( error ) {
                console.error( error );
            } );

        });
        return object3d;
    }

}
