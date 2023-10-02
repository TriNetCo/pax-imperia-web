import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getBasePath } from '../../models/helpers.js';
import { ThreeCache } from './threeCache.js';

export class SpaceViewLoader {

    /** @type {ThreeCache} */
    threeCache;

    constructor(threeCache, scene, system, renderer, camera) {
        this.scene = scene;
        this.system = system;
        this.threeCache = threeCache;
        this.renderer = renderer;
        this.camera = camera;
        window.threeCache = threeCache;
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
            promises.push(this.addWormholeText(wormhole));
        }

        for (const ship of this.system['ships']) {
            promises.push(this.loadShip(ship));
        }

        // Block here until all the parallel async functions are finished
        const object3ds = await Promise.all(promises.flat(Infinity));
        this.scene.add(...object3ds.flat(Infinity));

        // TODO: refactor to use OO
        const deltaTime = Date.now() - startTime;
        console.log(deltaTime + " ms: SpaceViewLoader entity loading");
    }

    loadStar(entity) {
        let clickableObj = this.threeCache.retrieve('star');
        if (clickableObj) {
            this.setLoadAttributes(entity, clickableObj);
            entity.linkObject3d(clickableObj);
        } else {
            clickableObj = this.loadClickableObject3d(entity, async (obj) => {
                this.addBrightenerMaterial(obj);
                await this.loadStarOrPlanetTexture(obj, entity.texturePath, false, 1);
                this.threeCache.push('star', obj);
            });
        }

        const coronas = this.createCoronaObject3ds(entity);

        return [clickableObj, coronas];
    }

    async createCoronaObject3ds(entity) {
        const coronaPath = entity.basePath + "/assets/orbitals/textures/sun/corona/corona.png";
        const coronaObj = await this.loadObject3d(coronaPath);
        this.setLoadAttributes(entity, coronaObj);
        const coronaScale = entity.scale.x * 2.4;
        coronaObj.scale.set(coronaScale, coronaScale, coronaScale);
        const coronaObjs = [coronaObj, coronaObj.clone(), coronaObj.clone()];
        coronaObjs.forEach(corona => { corona.notClickable = true; })
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
        const clickableObj = this.loadClickableObject3d(entity, async (obj) => {
            this.addMeshStandardMaterial(obj)
            this.loadStarOrPlanetTexture(obj, entity.texturePath, false, 0.9);
            entity.object3ds.push(obj);
        });

        // load the cloud cover object
        const cloudCover = this.loadCloudCover(entity);

        return [clickableObj, cloudCover];
    }

    loadShip(entity) {
        let clickableObj = this.threeCache.retrieve('GalacticLeopard6');
        if (clickableObj) {
            this.setLoadAttributes(entity, clickableObj);
            entity.linkObject3d(clickableObj);
        } else {
            console.log('creating new ship')
            clickableObj = this.loadClickableObject3d(entity, async (obj) => {
                // this.addMetallicSmoothnessMaterial(obj, entity.metallicSmoothnessMapPath);
                // this.addMeshStandardMaterial(obj)
                await this.loadAndApplyTexturesToShip(obj, entity);
                this.threeCache.push('GalacticLeopard6', obj);
            });
        }
        return clickableObj;
    }

    addMetallicSmoothnessMaterial(object3d, metallicSmoothnessMapPath) {
        const firstChild = object3d.children[0];
        const texture = firstChild.material.map;
        const normalMap = firstChild.material.normalMap;
        const metallicSmoothnessMap = firstChild.material.metallicSmoothnessMap;

        firstChild.material = new THREE.MeshStandardMaterial();
        firstChild.material.map = texture;
        firstChild.material.normalMap = normalMap;
        firstChild.material.metallicSmoothnessMap = metallicSmoothnessMap;
        firstChild.material.needsUpdate = true;
    }

    async loadCloudCover(entity) {
        const cloudCover = await this.loadObject3d(entity.cloudMeshPath);
        await this.loadStarOrPlanetTexture(cloudCover, entity.cloudTexturePath, true, 0.9);
        this.setLoadAttributes(entity, cloudCover);
        cloudCover.isClouds = true;
        cloudCover.notClickable = true;
        entity.object3ds.push(cloudCover);
        return cloudCover;
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
     *                   mesh so texturing and other operations dedatpendant may be
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
            // this.reportPerformance(entity.name + ' [cb]', startTimeCb);
        }

        // this.reportPerformance(entity.name + ' [clickableObj]', startTime);
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

    async loadObject3d(assetPath, isBillboard = true) {
        // check if already loaded in cache
        const assetPathSuffix = assetPath.replace(getBasePath(), '');
        let obj = this.threeCache.retrieve(assetPathSuffix);
        if (obj) {
            return obj;
        }
        const assetPathSplit = assetPath.split(".");
        const fileExt = assetPathSplit[assetPathSplit.length - 1];
        switch (fileExt) {
            case 'gltf':
            case 'glb':
                obj = await this.loadGltf(assetPath);
                break;
            case 'fbx':
                obj = await this.loadFbx(assetPath);
                break;
            case 'png':
                if (isBillboard) {
                    obj = await this.loadBillboard(assetPath);
                } else {
                    obj = await this.loadTexture(assetPath);
                }
                break;
            default:
                console.log('unknown file type')
                break;
        }
        this.threeCache.push(assetPathSuffix, obj);
        return obj;
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
                reject({ reason: error })
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
                reject({ reason: error })
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
                reject({ reason: error });
            });
        });
        return object3d;
    }

    /**
     * Load a texture, this is a heavy function...
     * @param {string} assetPath
     * @returns {Promise<THREE.Texture>}
     */
    async loadTexture(assetPath) {
        let texture;
        const loader = new THREE.TextureLoader();
        texture = new Promise((resolve, reject) => {
            loader.load(assetPath, (texture) => {
                resolve(texture);
            }, function (xhr) {
            }, function (error) {
                console.error(error);
                reject({ reason: error })
            });
        });
        return texture;
    }

    /**
     *
     * @param {THREE.Object3D} object3d
     * @param {string} texturePath
     * @param {boolean} transparent
     * @param {number} roughness
     */
    async loadStarOrPlanetTexture(object3d, texturePath, transparent = false, roughness = 0.9) {
        const texture = await this.loadTexture(texturePath);
        texture.flipY = false; // fixes Blender export bug
        // texture.generateMipmaps = false;

        object3d.traverse(function (child) {
            if (child.isMesh) {
                /** @type {THREE.MeshBasicMaterial} */
                const material = child.material;

                // cloud settings
                if (transparent) {
                    material.alphaMap = texture;
                    material.alphaTest = 0.1;
                    material.transparent = true;
                } else {
                    material.map = texture;
                }
                material.roughness = roughness;
                material.needsUpdate = true;
            }
        });
    }

    loadAndApplyTexturesToShip(object3d, entity) {
        const texture = this.loadTexture(entity.texturePath);
        const normalMap = this.loadTexture(entity.normalMapPath);
        const metallicSmoothnessMap = this.loadTexture(entity.metallicSmoothnessMapPath);
        const emissionMap = this.loadTexture(entity.emissionMapPath);

        return Promise.all([texture, normalMap, metallicSmoothnessMap, emissionMap])
            .then(([texture, normalMap, metallicSmoothnessMap, emissionMap]) => {
                texture.flipY = false; // fixes Blender export bug

                const material = new THREE.MeshStandardMaterial();
                material.metalnessMap = texture;
                material.map = texture;
                material.normalMap = normalMap;
                material.emissiveMap = emissionMap;
                material.metallicSmoothnessMap = metallicSmoothnessMap;
                material.needsUpdate = true;

                object3d.children[0].material = material;
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

    async loadBackground() {
        const path = getBasePath() + '/assets/backgrounds/space_view_background_tmp.png'
        const texture = await this.loadObject3d(path, false);
        this.scene.background = texture;
    }

    addAndCompile(obj) {
        if (this.scene && this.renderer) {
            this.scene.add(obj);
            this.renderer.compile(this.scene, this.camera);
        }
    }

    async addWormholeText(entity) {
        let text = entity.name || 'Sector' + entity.id;
        let opts = { fontface: 'Tahoma', fontsize: 26 };
        let sprite = this.makeTextSprite(text, opts);
        sprite.name = 'wormholeText';
        sprite.notClickable = true;
        // offset below (y) and slightly behind (z) wormhole graphic
        sprite.position.set(
            entity.position.x,
            entity.position.y - 1,
            entity.position.z - 0.1);
        return sprite;
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

}
