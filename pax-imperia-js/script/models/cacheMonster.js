import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getBasePath } from './helpers.js';

export default class CacheMonster {

    cache = {};
    hitCounter = {};

    constructor() {
    }

    async retrieve(assetPath) {
        const assetPathSuffix = assetPath.replace(getBasePath(), '');
        const fullAssetPath = getBasePath() + assetPathSuffix;

        // This class checks the cache for the texture being requested,
        // if it's been requested before, this class returns the promise for it
        if (this.cache[assetPathSuffix]) {
            this.hitCounter[assetPathSuffix] += 1;
            const obj = this.cache[assetPathSuffix];
            return obj.clone();
        }

        this.hitCounter[assetPathSuffix] = 0;
        this.cache[assetPathSuffix] = await this.loadAsset(fullAssetPath);

        const obj = this.cache[assetPathSuffix];
        return obj.clone();
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