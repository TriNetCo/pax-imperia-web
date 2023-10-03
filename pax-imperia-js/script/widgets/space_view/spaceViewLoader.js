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
            promises.push(this.loadStarClickableObj3d(star));
            promises.push(this.loadStarCoronaObj3ds(star));
        }

        for (const planet of this.system['planets']) {
            promises.push(this.loadPlanetClickableObj3d(planet));
            promises.push(this.loadPlanetCloudObj3d(planet));
        }

        for (const wormhole of this.system['wormholes']) {
            promises.push(this.loadWormholeObj3d(wormhole));
            promises.push(this.addWormholeText(wormhole));
        }

        for (const ship of this.system['ships']) {
            promises.push(this.loadShipObj3d(ship));
        }

        // Block here until all the parallel async functions are finished
        const object3ds = await Promise.all(promises.flat(Infinity));
        this.scene.add(...object3ds.flat(Infinity));

        // TODO: refactor to use OO
        const deltaTime = Date.now() - startTime;
        console.log(deltaTime + " ms: SpaceViewLoader entity loading");
    }

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

    loadStarClickableObj3d(entity) {
        const starAssetPaths = {
            'mesh': getBasePath() + '/assets/orbitals/meshes/planetbasemodel.glb',
            'texture': getBasePath() + '/assets/orbitals/textures/sun/yellow/YellowSun0001.png'
        }
        const starObj = this.loadTexturedObj3d(
            starAssetPaths,
            'YellowSun0001',
            entity,
            true,
            async (obj, assetPaths) => {
                this.addBrightenerMaterial(obj);
                await this.loadStarOrPlanetTexture(obj, assetPaths.texture, false, 1);
            }
        )
        return starObj;
    }

    async loadStarCoronaObj3ds(entity) {
        const coronaAssetPaths = {
            'mesh': getBasePath() + '/assets/orbitals/textures/sun/corona/corona.png',
        }
        const coronaObj = await this.loadTexturedObj3d(
            coronaAssetPaths,
            'corona',
            entity,
            false,
        )
        const coronaScale = entity.scale.x * 2.4;
        coronaObj.scale.set(coronaScale, coronaScale, coronaScale);
        // create 3 coronas
        const coronaObjs = [coronaObj, coronaObj.clone(), coronaObj.clone()];
        coronaObjs.forEach(corona => { corona.notClickable = true; })
        entity.coronaObject3ds = coronaObjs;
        return coronaObjs;
    }

    async loadPlanetClickableObj3d(entity) {
        const planetAssetPaths = {
            'mesh': getBasePath() + '/assets/orbitals/meshes/planetbasemodel.glb',
            'texture': getBasePath() + '/assets/orbitals/textures/earthlike/' + entity.atmosphere + '.png'
        }
        const planetObj = await this.loadTexturedObj3d(
            planetAssetPaths,
            entity.atmosphere,
            entity,
            true,
            async (obj, assetPaths) => {
                this.addMeshStandardMaterial(obj)
                this.loadStarOrPlanetTexture(obj, assetPaths.texture, false, 0.9);
            }
        )
        entity.object3ds.clickable = planetObj;
        return planetObj;
    }

    async loadPlanetCloudObj3d(entity) {
        const cloudAssetPaths = {
            'mesh': getBasePath() + '/assets/orbitals/meshes/cloudlayer.glb',
            'texture': getBasePath() + '/assets/orbitals/textures/clouds/' + entity.cloud_type + '.png'
        }
        const cloudObj = await this.loadTexturedObj3d(
            cloudAssetPaths,
            entity.cloud_type,
            entity,
            false,
            async (obj, assetPaths) => {
                this.addMeshStandardMaterial(obj)
                await this.loadStarOrPlanetTexture(obj, assetPaths.texture, true, 0.9);
                obj.isClouds = true;
                obj.notClickable = true;
            }
        )
        entity.object3ds.cloud = cloudObj;
        return cloudObj;
    }

    loadShipObj3d(entity) {
        const shipAssetPaths = {
            'mesh': getBasePath() + '/assets/ships/GalacticLeopard6.fbx',
            'texture': getBasePath() + '/assets/ships/GalacticLeopard_White.png',
            'normalMap': getBasePath() + '/assets/ships/GalacticLeopard_Normal.png',
            'metallicSmoothnessMap': getBasePath() + '/assets/ships/GalacticLeopard_MetallicSmoothness.png',
            'emissionMap': getBasePath() + '/assets/ships/GalacticLeopard_Emission2.png'
        };

        const shipObj = this.loadTexturedObj3d(
            shipAssetPaths,
            'GalacticLeopard6',
            entity,
            true,
            async (obj, assetPaths) => {
                await this.loadAndApplyTexturesToShip(obj, entity);
            }
        )
        return shipObj;
    }

    loadWormholeObj3d(entity) {
        const wormholeAssetPaths = {
            'mesh': getBasePath() + '/assets/wormholes/wormhole.png',
        }
        const wormholeObj = this.loadTexturedObj3d(
            wormholeAssetPaths,
            'Wormhole',
            entity,
            true
        )
        return wormholeObj;
    }

    async loadBackground() {
        const path = getBasePath() + '/assets/backgrounds/space_view_background_tmp.png'
        const texture = await this.loadObject3d(path, false);
        this.scene.background = texture;
    }

    /**
     * Loads the meshes and textures (via the callback) for the clickable
     * element of the entity (usually the surface mesh of the object).
     *
     * @param {*} assetPaths - Hash of paths including 'mesh' for the base mesh and
     *                         additional textures and maps
     * @param {*} cacheName  - Name under which to cache the obj3d

     * @param {*} entity     - This is the entity to which we're loading a clickable mesh
     * @param {*} clickable  - whether entity should link to obj3d (for clicking)
     * @param {*} cb         - This callback is called after the loading of the initial
     *                         mesh so texturing and other operations dedatpendant may be
     *                         performed.
     * @returns <Promise>
     */
    async loadTexturedObj3d(assetPaths, cacheName = null, entity = null, clickable = true, cb = null) {
        let clickableObj;
        if (cacheName) {
            clickableObj = this.threeCache.retrieve(cacheName);
        }
        if (!clickableObj) {
            clickableObj = await this.loadObject3d(assetPaths.mesh);
            if (cb) {
                await cb(clickableObj, assetPaths);
            }
            this.threeCache.push(cacheName, clickableObj);
        }

        this.setLoadAttributes(entity, clickableObj);
        if (entity && clickable) {
            entity.linkObject3d(clickableObj);
        }
        return clickableObj;
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
