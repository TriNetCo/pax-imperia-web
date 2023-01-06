import { unpackData } from '../../../models/helpers.js'
import { Star } from './star.js';
import { Planet } from './planet.js';
import { Ship } from './ship.js';

export class System {

    constructor(systemData) {
        unpackData(systemData, this);
        this.stars = this.createRepresentations(systemData.stars, Star, this.name);
        this.planets = this.createRepresentations(systemData.planets, Planet, this.name);
        this.ships = this.createRepresentations(systemData.ships, Ship, this.name);
    }

    createRepresentations (entitiesData, cls, systemName) {
        let representations = [];
        for (const entityData of entitiesData) {
            let representation = new cls(entityData, systemName);
            representations.push(representation);
        };
        return representations;
    }

    async load (scene) {
        let entities = this.stars.concat(this.planets).concat(this.ships);
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            await entity.load(scene);
        }
    }
}
