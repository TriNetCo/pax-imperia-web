import * as THREE from 'three';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/FBXLoader.js";

export class SystemLoader {
    constructor(system, scene) {
        this.scene = scene;
        this.system = system;
    }

    async loadStars () {
        for (const star of this.system['stars']) {
            let name = star['name'];
            let object3d = await this.loadStar(name, star['size']);
            star['object3d'] = object3d;
            object3d.gameObject = star;

            let texture = object3d.children[0].material.map;
            object3d.children[0].material = new THREE.MeshBasicMaterial();
            object3d.children[0].material.map = texture;
        }
    }

    async loadPlanets () {
        for (const planet of this.system['planets']) {
            let name = "" + planet["index"]
            let size = planet['size'];
            let atmosphere = planet['atmosphere']
            let z = 2 * planet['distance_from_star'];
            let object3d = await this.loadPlanet(name, atmosphere, size, z);
            planet['object3d'] = object3d;
            object3d.gameObject = planet;
        }
    }

    async loadShips () {
        var ship = await this.loadShip();
        ship.object3d = {};
        ship.gameObject = {}; // workaround for selectionBox
        return [ship]
    }

    async loadStar(name, size) {
        console.log("loading star")
        let assetPath = "/assets/sun.gltf";
        let position = {x: 0, y: 0, z: 0};
        let scale = {x: size, y: size, z: size};
        let object3d = await this.loadObject3d(name, assetPath, scale, position);
        return object3d
    }

    async loadPlanet(name, atmosphere, size, z) {
        console.log("loading planet " + name + " with atmosphere " + atmosphere)
        let assetPath = "/assets/" + atmosphere + ".gltf";
        let position = {x: 0, y: 0, z: z};
        let scale = {x: size, y: size, z: size};
        let object3d = await this.loadObject3d(name, assetPath, scale, position);
        return object3d
    }

    async loadShip() {
        console.log("loading ship")
        let name = "ship"
        let assetPath = '/script/assets/GalacticLeopard6.fbx';
        let size = 0.0002;
        let scale = {x: size, y: size, z: size}
        let position = {x: 0, y: 4, z: 4}
        let rotation = {x: 2* Math.PI, y: 1.5708, z: 2*Math.PI/4};
        let object3d = await this.loadObject3d(name, assetPath, scale, position, rotation, 'fbx');
        return object3d
    }

    async loadObject3d(name,
                 assetPath,
                 scale = {x: 1, y: 1, z: 1},
                 position = {x: 0, y: 0, z: 0},
                 rotation = {x: 0, y: 0, z: 0},
                 loaderType = 'gltf') {
        let loader;
        if (loaderType == 'gltf') {
            loader = new GLTFLoader();
        } else {
            loader = new FBXLoader();
        }
        let scene = this.scene;
        let object3d = new Promise(function(resolve, reject) {
            loader.load(assetPath, function ( input ) {
                let obj;
                if (loaderType == 'gltf') {
                    obj = input.scene;
                } else {
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