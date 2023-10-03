import { SpaceViewLoader } from "./spaceViewLoader.js";
import { getBasePath } from "../../models/helpers.js";
import { Ship } from "../space_view/entities/ship.js";
import { Star } from "./entities/star.js";
import { Wormhole } from "./entities/wormhole.js";

export class ThreeCache {

    constructor() {
        this.cache = {};
        this.preCache();
    }

    async preCache() {
        console.log('starting preCache')

        const spaceViewLoader = new SpaceViewLoader(this);
        const promises = [];

        // background
        const backgroundPath = getBasePath() + '/assets/backgrounds/space_view_background_tmp.png';
        const backgroundTexture = spaceViewLoader.loadObject3d(backgroundPath, false);
        promises.push(backgroundTexture);

        promises.push(spaceViewLoader.loadStarClickableObj3d(new Star));
        promises.push(spaceViewLoader.loadShipObj3d(new Ship));
        // promises.push(spaceViewLoader.loadWormholeObj3d(new Wormhole));

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
        if (name && !this.cache[name]) {
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