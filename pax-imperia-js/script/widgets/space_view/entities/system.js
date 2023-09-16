import { unpackData, packData, getRandomNum } from '../../../models/helpers.js'
import { Star } from './star.js';
import { Planet } from './planet.js';
import { Ship } from './ship.js';
import { Wormhole } from './wormhole.js';

export class System {

    constructor(systemData) {
        unpackData(systemData, this);
        this.stars = this.createRepresentations(systemData.stars, Star, this.name, this.id);
        this.planets = this.createRepresentations(systemData.planets, Planet, this.name, this.id);
        this.wormholes = this.createRepresentations(systemData.connections, Wormhole, this.name, this.id, systemData.position);
        this.ships = this.createRepresentations(systemData.ships, Ship, this.name, this.id);
        this.placeWormholedShips();
    }

    createRepresentations (entitiesData, cls, systemName, systemId, systemPosition=null) {
        let representations = [];
        for (const entityData of entitiesData) {
            let representation = new cls(entityData, systemName, systemId, systemPosition);
            representations.push(representation);
        };
        return representations;
    }

    placeWormholedShips() {
        for (const ship of this.ships) {
            if (ship.previousSystemId) {
                const wormhole = this.wormholes.find(x => x.id === ship.previousSystemId);
                ship.position.x = wormhole.position.x + getRandomNum(-2, 2, 2);
                ship.position.y = wormhole.position.y + getRandomNum(-2, 2, 2);
                ship.position.z = wormhole.position.z + 1;
            }
        };

    }

    async load (scene) {
        let entities = this.stars.concat(this.planets).concat(this.wormholes).concat(this.ships);
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            await entity.load(scene);
        }
    }

}
