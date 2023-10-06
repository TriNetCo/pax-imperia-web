import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getBasePath } from '../../models/helpers.js';
import CacheMonster from '../../models/cacheMonster.js';
import { Entity } from './entities/entity.js';
import { TimeLord } from '../../models/timeLord.js';

export class SpaceViewLoader {

    /**
     *
     * @param {CacheMonster} cacheMonster
     * @param {*} scene
     * @param {*} system
     * @param {*} renderer
     * @param {*} camera
     */
    constructor(cacheMonster, scene, system, renderer, camera) {
        this.scene = scene;
        this.system = system;
        this.cacheMonster = cacheMonster;
        this.renderer = renderer;
        this.camera = camera;
        window.cacheMonster = cacheMonster;
    }

    async load() {
        const startTime = Date.now()
        const promises = [];

        for (const star of this.system['stars']) {
            promises.push(this.loadStarStuff(star));
        }

        for (const planet of this.system['planets']) {
            // load planet
            promises.push(this.loadPlanetSurface(planet));
            promises.push(this.loadPlanetCloud(planet));
        }

        for (const wormhole of this.system['wormholes']) {
            // load wormhole
            promises.push(this.loadWormhole(wormhole));
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

    async loadStarStuff(entity) {
        const primary = await this.loadStarSurface(entity);
        const stuff = await this.loadStarCoronas(entity)
        return [primary, stuff];
    }

    /**
     *
     * @param {Entity} entity
     * @returns {Promise<THREE.Object3D>}
     */
    async loadStarSurface(entity) {
        const starAssetPaths = {
            'mesh': getBasePath() + '/assets/orbitals/meshes/planetbasemodel.glb',
            'texture': getBasePath() + '/assets/orbitals/textures/sun/yellow/YellowSun0001.png'
        }
        const starObj = await this.cacheMonster.retrieveObject3d(
            'YellowSun0001',
            async (assetPaths) => {
                const obj = await this.cacheMonster.retrieveAsset(assetPaths.mesh);
                this.addBrightenerMaterial(obj);
                await this.loadStarOrPlanetTexture(obj, assetPaths.texture, false, 1);
                return obj;
            },
            starAssetPaths
        )

        this.setLoadAttributes(entity, starObj);
        entity.linkObject3d(starObj);
        return starObj;
    }

    /**
     * @param {Entity} entity
     * @returns {Promise<THREE.Object3D[]>}
     */
    async loadStarCoronas(entity) {
        const coronaObj = await this.cacheMonster.retrieveObject3d(
            'corona',
            async () => {
                return await this.loadBillboard('/assets/orbitals/textures/sun/corona/corona.png');
            }
        );
        // set position, scale, etc. attributes
        this.setLoadAttributes(entity, coronaObj)
        const coronaScale = entity.scale.x * 2.4;
        coronaObj.scale.set(coronaScale, coronaScale, coronaScale);
        // create 3 coronas
        const coronaObjs = [coronaObj, coronaObj.clone(), coronaObj.clone()];
        coronaObjs.forEach(corona => { corona.notClickable = true; })
        entity.coronaObject3ds = coronaObjs;
        return coronaObjs;
    }

    /**
     * @param {Entity} entity
     * @returns {Promise<THREE.Object3D[]>}
     */
    async loadPlanetSurface(entity) {
        const planetAssetPaths = {
            'mesh': getBasePath() + '/assets/orbitals/meshes/planetbasemodel.glb',
            'texture': getBasePath() + '/assets/orbitals/textures/earthlike/' + entity.atmosphere + '.png'
        }

        const planetObj = await this.cacheMonster.retrieveObject3d(
            entity.atmosphere,
            async (assetPaths) => {
                const obj = await this.cacheMonster.retrieveAsset(assetPaths.mesh);
                this.addMeshStandardMaterial(obj)
                await this.loadStarOrPlanetTexture(obj, assetPaths.texture, false, 0.9);
                return obj;
            },
            planetAssetPaths
        );

        this.setLoadAttributes(entity, planetObj);
        entity.linkObject3d(planetObj);
        entity.object3ds.clickable = planetObj;
        return planetObj;
    }

    /**
     * @param {Entity} entity
     * @returns {Promise<THREE.Object3D[]>}
     */
    async loadPlanetCloud(entity) {
        const cloudAssetPaths = {
            'mesh': getBasePath() + '/assets/orbitals/meshes/cloudlayer.glb',
            'texture': getBasePath() + '/assets/orbitals/textures/clouds/' + entity.cloud_type + '.png'
        }

        const cloudObj = await this.cacheMonster.retrieveObject3d(
            entity.cloud_type,
            async (assetPaths) => {
                const obj = await this.cacheMonster.retrieveAsset(assetPaths.mesh);
                this.addMeshStandardMaterial(obj)
                await this.loadStarOrPlanetTexture(obj, assetPaths.texture, true, 0.9);
                return obj;
            },
            cloudAssetPaths
        );

        cloudObj.isClouds = true;
        cloudObj.notClickable = true;

        this.setLoadAttributes(entity, cloudObj);
        entity.object3ds.cloud = cloudObj;
        return cloudObj;
    }

    async loadWormhole(entity) {
        const wormholeObj = await this.cacheMonster.retrieveObject3d(
            'wormhole',
            async (assetPaths) => {
                return await this.loadBillboard('/assets/wormholes/wormhole.png');
            }
        );
        entity.linkObject3d(wormholeObj);
        this.setLoadAttributes(entity, wormholeObj);
        return wormholeObj;
    }




    // TODO: convert to retrieveObject3d pattern
    loadShip(entity) {
        // const assetPaths = [
        //     entity.assetPath, entity.texturePath,
        //     entity.normalMapPath, entity.metallicSmoothnessMapPath,
        //     entity.emissionMapPath
        // ];
        // assetPaths.forEach(assetPath => { this.cacheMonster.addToCache(assetPath) });

        const clickableObj = this.loadClickableObject3d(entity, async (obj) => {
            // this.addMetallicSmoothnessMaterial(obj, entity.metallicSmoothnessMapPath);
            // this.addMeshStandardMaterial(obj)
            await this.loadAndApplyTexturesToShip(obj, entity);
        });
        // entity.linkObject3d(clickableObj);
        return clickableObj;
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
        const timeLord = new TimeLord();
        const object3d = await this.cacheMonster.retrieveAsset(entity.assetPath);

        this.setLoadAttributes(entity, object3d);
        entity.linkObject3d(object3d);

        if (cb) {
            await cb(object3d);
            timeLord.endAndReset('load ' + entity.name + " " + entity.type)
            // await this.addAndCompile(object3d);
            timeLord.end('compile ' + entity.name + " " + entity.type);
        }

        return object3d;
    }

    async loadBackground() {
        const path = '/assets/backgrounds/space_view_background_tmp.png'
        const texture = await this.cacheMonster.retrieveAsset(path);
        this.scene.background = texture;
    }

    // This makes it so the star doesn't have a shadow and is always lit
    addBrightenerMaterial(object3d) {
        const firstChild = object3d.children[0];
        const texture = firstChild.material.map;
        firstChild.material = new THREE.MeshBasicMaterial();
        firstChild.material.map = texture;
        firstChild.material.needsUpdate = true;
    }

    addMeshStandardMaterial(object3d) {
        const material = new THREE.MeshStandardMaterial();
        material.roughness = 0.9;
        material.metalness = 0.1;
        material.color = new THREE.Color(0x9999cc);
        material.needsUpdate = true;
        object3d.children[0].material = material;
    }

    async loadBillboard(assetPath) {
        const texture = await this.cacheMonster.retrieveAsset(assetPath);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        return new THREE.Sprite(spriteMaterial);
    }

    /**
     *
     * @param {THREE.Object3D} object3d
     * @param {string} texturePath
     * @param {boolean} transparent
     * @param {number} roughness
     */
    async loadStarOrPlanetTexture(object3d, texturePath, transparent = false, roughness = 0.9) {
        const texture = await this.cacheMonster.retrieveAsset(texturePath);
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

    async loadAndApplyTexturesToShip(object3d, entity) {
        const texture = this.cacheMonster.retrieveAsset(entity.texturePath);
        const normalMap = this.cacheMonster.retrieveAsset(entity.normalMapPath);
        const metallicSmoothnessMap = this.cacheMonster.retrieveAsset(entity.metallicSmoothnessMapPath);
        const emissionMap = this.cacheMonster.retrieveAsset(entity.emissionMapPath);

        await Promise.all([texture, normalMap, metallicSmoothnessMap, emissionMap])
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

    async addAndCompile(obj) {
        if (this.scene && this.renderer) {
            await this.scene.add(obj);
            await this.renderer.compile(this.scene, this.camera);
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

}

// NOTES
// load single child
//   e.g. Star, Planet, Ship, Wormhole, clouds, corona
//   complete means base mesh with all textures, layers
// STEPS
// check if cached
// if cached -> pull complete obj3d from cache
// if not cached
//   1. load base (mesh or billboard)
//   2. execute custom cb for textures, materials, etc. and apply to base
//      to create complete obj3d
//   3. set attributes (position, rotation)
//   4. link to entity IF clickableObj
//   5. push complete obj3d to cache
// return obj3d promise
