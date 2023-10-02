import { SpaceViewLoader } from "./spaceViewLoader.js";

export class ThreeCache {

    constructor() {
        this.cache = {};
        this.preCachePaths = [
            '/assets/orbitals/meshes/planetbasemodel.glb',
            '/assets/orbitals/textures/sun/corona/corona.png',
            '/assets/wormholes/wormhole.png'
        ];
    }

    // async preCache() {
    //     const promises = [];
    //     this.preCachePaths.forEach(path => {
    //         promises.push(path);
    //     })
    //     await Promise.all(promises);
    // }

    retrieve(name) {
        if (this.cache[name]) {
            this.cache[name]['count'] += 1;
            return this.cache[name]['obj'].clone();
        }
        return;
    }

    push(name, obj) {
        if (!this.cache[name]) {
            this.cache[name] = { 'obj': obj.clone(), 'count': 0 };
            console.log('caching', name);
        }
    }

    alreadyCached(name) {
        if (this.cache[name]) {
            return true;
        }
        return false;
    }

}