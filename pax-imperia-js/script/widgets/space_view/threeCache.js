import { SpaceViewLoader } from "./spaceViewLoader.js";
import { getBasePath } from "../../models/helpers.js";
import { Ship } from "../space_view/entities/ship.js";
import { Star } from "./entities/star.js";

export class ThreeCache {

    constructor() {
        this.cache = {};
        this.preCachePaths = [
            '/assets/orbitals/meshes/planetbasemodel.glb',
            '/assets/orbitals/textures/sun/corona/corona.png',
            '/assets/wormholes/wormhole.png',
        ];
        this.preCache();
    }

    async preCache() {
        console.log('starting preCache')

        const spaceViewLoader = new SpaceViewLoader(this);
        const promises = [];
        this.preCachePaths.forEach(path => {
            const obj = spaceViewLoader.loadObject3d(getBasePath() + path);
            promises.push(obj);
        })
        const backgroundPath = '/assets/backgrounds/space_view_background_tmp.png'
        const backgroundTexture = spaceViewLoader.loadObject3d(getBasePath() + backgroundPath, false);
        promises.push(backgroundTexture);

        const starObj = spaceViewLoader.loadStar(new Star);
        promises.push(starObj);

        const shipObj = spaceViewLoader.loadShip(new Ship);
        promises.push(shipObj);

        const resolution = await Promise.all(promises);
        console.log('finished preCache')
        return resolution;
    }

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