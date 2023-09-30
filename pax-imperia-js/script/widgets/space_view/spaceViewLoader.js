import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class SpaceViewLoader {

    constructor(scene, system) {
        this.scene = scene;
        this.system = system;
    }

    async load() {
        const startTime = Date.now()
        const promises = [];

        for (const star of this.system['stars']) {
            promises.push(...this.loadStar(star));
        }

        for (const planet of this.system['planets']) {
            promises.push(...this.loadPlanet(planet));
        }

        for (const wormhole of this.system['wormholes']) {
            promises.push(this.loadClickableObject3d(wormhole));
            this.addWormholeText(wormhole);
        }

        for (const ship of this.system['ships']) {
            promises.push(this.loadClickableObject3d(ship));
        }

        // Block here until all the parallel async functions are finished
        const object3ds = await Promise.all(promises.flat(Infinity));
        this.scene.add(...object3ds.flat(Infinity));

        const deltaTime = Date.now() - startTime;
        console.log("Load complete in " + deltaTime + " ms");
    }

    loadStar(entity) {
        const clickableObjPromise = this.loadClickableObject3d(entity, async (obj) => {
            this.addBrightenerMaterial(obj);
            await this.loadStarOrPlanetTexture(obj, entity.texturePath, false, 1);
        });
        const coronasPromise = this.createCoronaObject3ds(entity);

        return [clickableObjPromise, coronasPromise];
        // const awaitables = await Promise.all([clickableObjPromise, coronasPromise])
        // return awaitables.flat();
    }

    async createCoronaObject3ds(entity) {
        const coronaPath = entity.basePath + "/assets/orbitals/textures/sun/corona/corona.png";
        const coronaObj = await this.loadBillboard(coronaPath);
        this.setLoadAttributes(entity, coronaObj);
        const coronaScale = entity.scale.x * 2.4;
        coronaObj.scale.set(coronaScale, coronaScale, coronaScale);
        coronaObj.notClickable = true;
        const coronaObjs = [coronaObj, coronaObj.clone(), coronaObj.clone()];
        entity.coronaObject3ds = coronaObjs;
        return coronaObjs;
    }

    // This makes it so the star doesn't have a shadow and is always lit
    addBrightenerMaterial(object3d) {
        const firstChild = object3d.children[0];
        const texture = firstChild.material.map;
        firstChild.material = new THREE.MeshBasicMaterial();
        firstChild.material.map = texture;
        firstChild.material.needsUpdate = true;
    }

    loadPlanet(entity) {
        entity.object3ds = [];

        // load the surface
        const primary = this.loadClickableObject3d(entity, async (obj) => {
            this.addMeshStandardMaterial(obj)
            await this.loadStarOrPlanetTexture(obj, entity.texturePath, false, 0.9);
            entity.object3ds.push(obj);
        });

        // load the clouds
        const clouds = this.loadClouds(entity);

        return [primary, clouds];
    }

    async loadClouds(entity) {
        const clouds = await this.loadObject3d(entity.cloudMeshPath);
        await this.loadStarOrPlanetTexture(clouds, entity.cloudTexturePath, true, 0.9);
        this.setLoadAttributes(entity, clouds);
        clouds.isClouds = true;
        clouds.notClickable = true;
        entity.object3ds.push(clouds);
        return clouds;
    }

    addMeshStandardMaterial(object3d) {
        const material = new THREE.MeshStandardMaterial();
        material.roughness = 0.9;
        material.metalness = 0.1;
        material.color = new THREE.Color(0x9999cc);
        material.needsUpdate = true;
        object3d.children[0].material = material;
    }

    /**
     * Loads the meshes and textures (via the callback) for the clickable
     * element of the entity (usually the surface mesh of the object).
     *
     * @param {*} entity - This is the entity to which we're loading a clickable mesh
     * @param {*} cb     - This callback is called after the loading of the initial
     *                   mesh so texturing and other operations dependant may be
     *                   performed.
     * @returns
     */
    async loadClickableObject3d(entity, cb) {
        const startTime = Date.now();
        const object3d = await this.loadObject3d(entity.assetPath);
        this.setLoadAttributes(entity, object3d);
        entity.linkObject3d(object3d);

        if (cb) {
            const startTimeCb = Date.now();
            await cb(object3d);
            this.reportPerformance(entity.name + ' [cb]', startTimeCb);
        }

        this.reportPerformance(entity.name + ' [clickableObj]', startTime);
        return object3d;
    }

    /**
     *
     * @param {string} msg       - This message gets printed to the screen
     * @param {number} startTime - Begin timing performance by creating a
     *                             Date.now() timestamp before executing the
     *                             code you would like timed.
     */
    reportPerformance(msg, startTime) {
        const deltaTime = (Date.now() - startTime);
        console.log(msg + ' loaded in ' + deltaTime + ' ms');
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
                console.log('load billboard')
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

    /**
     * Load a texture, this is a heavy function...
     * @param {string} assetPath
     * @returns {THREE.Texture}
     */
    loadTexture(assetPath) {
        const loader = new THREE.TextureLoader();
        const texturePromise = new Promise(function (resolve, reject) {
            loader.load(assetPath, function (texture) {
                resolve(texture);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
                reject({ reason: error })
            });
        });
        return texturePromise;
    }

    async loadStarOrPlanetTexture(object3d, texturePath, transparent = false, roughness = 0.9) {
        const texture = await this.loadTexture(texturePath);
        // fixes Blender export bug
        texture.flipY = false;
        // texture.generateMipmaps = false;

        object3d.traverse(function (/**Three.Object3D*/child) {
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