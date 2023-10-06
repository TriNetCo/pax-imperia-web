import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getBasePath } from './helpers.js';
import TimeLord from './timeLord.js';

export default class CacheMonster {

    assetCache = {};
    objCache = {};
    hitCounter = {};
    camera;

    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
    }

    /**
     * This function will either return an asset from the cache, or load it using
     * a THREE.js loader and add it to the cache as a promise.  The cached promise
     * is returned.
     *
     * @param {string} assetPath
     * @returns {Promise<THREE.Texture> | Promise<THREE.Object3D>}
     */
    async retrieveAsset(assetPath) {
        const assetPathSuffix = assetPath.replace(getBasePath(), '');
        this.addAssetToCache(assetPathSuffix);

        const timeLord = new TimeLord();
        const cachedObj = await this.assetCache[assetPathSuffix];
        this.hitCounter[assetPathSuffix] += 1;
        timeLord.end('retrieve ' + assetPathSuffix +
            ' counter: ' + this.hitCounter[assetPathSuffix]);

        return cachedObj.clone();
    }


    /**
     * Returns an entire Object3D from the cache or creates one if a cache hit of that
     * name could not occur.
     *
     * @param {string} name - The name for the cached object3D
     * @param {CallableFunction} cb - This is the callback for texturing a mesh.
     * @returns
     */
    async retrieveObject3d(name, cb) {
        if (!this.objCache[name]) {
            this.addObject3dToCache(name, cb)
        }

        const timeLord = new TimeLord();
        const obj = await this.objCache[name];
        this.hitCounter[name] += 1;
        timeLord.end('retrieve ' + name +
            ' counter: ' + this.hitCounter[name]);
        return obj.clone();
    }

    /////////////////////
    // Private Methods //
    /////////////////////

    addAssetToCache(assetPath) {
        const assetPathSuffix = assetPath.replace(getBasePath(), '');
        const fullAssetPath = getBasePath() + assetPathSuffix;

        if (!this.assetCache[assetPathSuffix]) {
            // console.log('Caching: ' + assetPathSuffix)
            this.createCounter(assetPathSuffix);
            this.assetCache[assetPathSuffix] = this.loadAsset(fullAssetPath);
        }
    }

    addObject3dToCache(name, cb) {
        if (!this.objCache[name]) {
            console.log('Caching: ' + name);
            this.createCounter(name);
            this.objCache[name] = cb();
        }
    }

    createCounter(assetPath) {
        if (!this.hitCounter[assetPath]) {
            this.hitCounter[assetPath] = 0;
        }
    }

    async loadAsset(assetPath) {
        const assetPathSplit = assetPath.split(".");
        const fileExt = assetPathSplit[assetPathSplit.length - 1];
        let obj;
        switch (fileExt) {
            case 'gltf':
            case 'glb':
                obj = await this.loadGltf(assetPath);
                break;
            case 'fbx':
                obj = await this.loadFbx(assetPath);
                break;
            case 'png':
                obj = await this.loadTexture(assetPath);
                break;
            default:
                console.log('unknown file type')
                break;
        }
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

}