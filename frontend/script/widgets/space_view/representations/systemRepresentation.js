import { unpackData } from '/script/models/helpers.js';
import { StarRepresentation } from './starRepresentation.js';
import { PlanetRepresentation } from './planetRepresentation.js';
import { ShipRepresentation } from './shipRepresentation.js';

export class SystemRepresentation {

    constructor(systemData) {
        unpackData(systemData, this);
        this.stars = this.createRepresentations(systemData.stars, StarRepresentation, this.name);
        this.planets = this.createRepresentations(systemData.planets, PlanetRepresentation, this.name);
        this.ships = this.createRepresentations(systemData.ships, ShipRepresentation, this.name);
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
