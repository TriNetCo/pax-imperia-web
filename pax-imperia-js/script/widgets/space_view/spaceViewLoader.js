import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class SpaceViewLoader {

    constructor(scene, system) {
        this.scene = scene;
        this.system = system;
    }

    async load() {
        for (const star of this.system['stars']) {
            const object3ds = await this.loadStar(star);
            this.addObject3dsToScene(object3ds);
        }

        for (const planet of this.system['planets']) {
            const object3ds = await this.loadPlanet(planet);
            this.addObject3dsToScene(object3ds);
        }

        for (const wormhole of this.system['wormholes']) {
            const object3ds = await this.loadClickableObject3d(wormhole);
            this.addObject3dsToScene(object3ds);
            this.addWormholeText(wormhole);
        }

        for (const ship of this.system['ships']) {
            const object3ds = await this.loadClickableObject3d(ship);
            this.addObject3dsToScene(object3ds);
        }

    }

    addObject3dsToScene(object3ds) {
        if (Array.isArray(object3ds)) {
            this.scene.add(...object3ds);
        } else {
            this.scene.add(object3ds);
        }
    }

    async loadStar(entity) {
        // create star surface
        const startTime = Date.now();

        const clickableObj = await this.loadClickableObject3d(entity, (obj) => {
            const deltaTime = (Date.now() - startTime);
            console.log('clickable object loaded it took ' + deltaTime + 'ms');
            console.log(obj);
            this.loadStarPlanetTexture(obj, entity.texturePath, false, 1);
            this.addBrightenerMaterial(obj);
        });

        // create coronas
        const coronaObj = await this.createCoronaObject3d(entity);
        entity.coronaObject3ds = [coronaObj, coronaObj.clone(), coronaObj.clone()];
        return [clickableObj, ...entity.coronaObject3ds]
    }

    async createCoronaObject3d(entity) {
        const coronaPath = entity.basePath + "/assets/orbitals/textures/sun/corona/corona.png";
        const coronaObj = await this.loadBillboard(coronaPath);
        this.setLoadAttributes(entity, coronaObj);
        const coronaScale = entity.scale.x * 2.4;
        coronaObj.scale.set(coronaScale, coronaScale, coronaScale);
        coronaObj.notClickable = true;
        return coronaObj;
    }

    // This makes it so the star doesn't have a shadow and is always lit
    addBrightenerMaterial(object3d) {
        const firstChild = object3d.children[0];
        let texture = firstChild.material.map;
        firstChild.material = new THREE.MeshBasicMaterial();
        firstChild.material.map = texture;
        firstChild.material.needsUpdate = true;
    }

    async loadPlanet(entity) {
        entity.object3ds = [];

        // load the surface
        const primary = await this.loadClickableObject3d(entity)
        this.addMeshStandardMaterial(primary)
        this.loadStarPlanetTexture(primary, entity.texturePath, false, 0.9);
        entity.object3ds.push(primary);

        // load the clouds
        const clouds = await this.loadObject3d(entity.cloudMeshPath);
        this.loadStarPlanetTexture(clouds, entity.cloudTexturePath, true, 0.9);
        this.setLoadAttributes(entity, clouds);
        clouds.isClouds = true;
        clouds.notClickable = true;
        entity.object3ds.push(clouds);

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

    async loadClickableObject3d(entity, cb) {
        const object3d = await this.loadObject3d(entity.assetPath);
        this.setLoadAttributes(entity, object3d);

        // object3d can call parent entity and vice versa
        // entity.linkObject3d(object3d)
        object3d.parentEntity = entity;  // TODO: rename parentEntity to just entity
        entity.object3d = object3d;

        if (cb) {
            cb(object3d);
        }
        return object3d;
    }

    async loadObject3d(assetPath) {
        const assetPathSplit = assetPath.split(".");
        const fileExt = assetPathSplit[assetPathSplit.length - 1];
        switch (fileExt) {
            case 'gltf':
            case 'glb':
                return await this.loadGltf(assetPath);
            case 'fbx':
                return await this.loadFbx(assetPath);
            case 'png':
                return await this.loadBillboard(assetPath);
            default:
                console.log('unknown file type')
        }
    }

    async loadGltf(assetPath) {
        const loader = new GLTFLoader();
        const object3d = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (input) {
                const obj = input.scene;
                resolve(obj);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
            });
        });
        return object3d;
    }

    async loadFbx(assetPath) {
        const loader = new FBXLoader();
        const object3d = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (input) {
                const obj = input;
                resolve(obj);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
            });
        });
        return object3d;
    }

    async loadBillboard(assetPath) {
        const loader = new THREE.TextureLoader();
        const object3d = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (input) {
                const spriteMaterial = new THREE.SpriteMaterial({ map: input });
                const obj = new THREE.Sprite(spriteMaterial);
                resolve(obj);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
            });
        });
        return object3d;
    }

    loadStarPlanetTexture(object3d, texturePath, transparent = false, roughness = 0.9) {
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

    setLoadAttributes(entity, object3d) {
        object3d.position.set(entity.position.x, entity.position.y, entity.position.z);
        // rotation is in radians
        object3d.rotation.set(entity.rotation.x, entity.rotation.y, entity.rotation.z);
        object3d.scale.set(entity.scale.x, entity.scale.y, entity.scale.z);
        object3d.name = entity.name;
        if (object3d.children[0]) {
            object3d.children[0].name = entity.name;
        }
    }

    addWormholeText(entity) {
        let text = entity.name || 'Sector' + entity.id;
        let opts = { fontface: 'Tahoma' };
        let sprite = this.makeTextSprite(text, opts);
        sprite.name = 'wormholeText';
        sprite.notClickable = true;
        this.scene.add(sprite);
        sprite.position.set(entity.position.x, entity.position.y, entity.position.z + 0.5);
    }

    makeTextSprite(text, opts) {
        var parameters = opts || {};
        var fontface = parameters.fontface || 'Tahoma';
        var fontsize = parameters.fontsize || 20;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var metrics = context.measureText(text);
        var textWidth = metrics.width;

        // text color
        context.fillStyle = 'rgba(255, 255, 255, 1.0)';
        context.fillText(text, 0, fontsize);

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas)
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(10, 5, 1.0);
        sprite.center.set(textWidth / canvas.width / 2, 1);
        return sprite;
    }

    async loadParallelModels(scene) {
        const entities = this.system.stars
            .concat(this.system.planets)
            .concat(this.system.wormholes)
            .concat(this.system.ships);
        // const entities = this.system.planets.concat(this.system.wormholes).concat(this.system.ships);
        const promiseFunctions = [];
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            promiseFunctions.push(entity.load(scene));
        }

        Promise.all(promiseFunctions)
            .then((results) => {
                // All promises resolved successfully
                // Handle the results
                console.log('promise start');
                results.forEach((result) => {
                    if (Array.isArray(result)) {
                        scene.add(...result);
                    } else {
                        scene.add(result);
                    }
                });
                console.log('promise end')
            })
            .catch((error) => {
                // Handle errors if any of the promises reject
                console.log(error)
            });
    }

}