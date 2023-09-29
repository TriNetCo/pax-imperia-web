import { Star } from './star.js';
import { Planet } from './planet.js';
import { Ship } from './ship.js';
import { Wormhole } from './wormhole.js';
import { unpackData } from '../../../models/helpers.js'

export class System {

    constructor(systemData) {
        unpackData(systemData, this);
        this.stars = this.createRepresentations(systemData.stars, Star, this.name, this.id);
        this.planets = this.createRepresentations(systemData.planets, Planet, this.name, this.id);
        this.wormholes = this.createRepresentations(systemData.connections, Wormhole, this.name, this.id, systemData.position);
        this.ships = this.createRepresentations(systemData.ships, Ship, this.name, this.id);
    }

    toJSON() {
        const systemJson = {
            id: this.id,
            name: this.name,
            position: this.position,
            radius: this.radius,
            connections: this.connections,
            stars: this.stars,
            planets: this.planets,
            ships: this.ships
        };
        return systemJson;
    }

    createRepresentations(entitiesData, cls, systemName, systemId, systemPosition = null) {
        let representations = [];
        for (const entityData of entitiesData) {
            let representation = new cls(entityData, systemName, systemId, systemPosition);
            representations.push(representation);
        };
        return representations;
    }

}