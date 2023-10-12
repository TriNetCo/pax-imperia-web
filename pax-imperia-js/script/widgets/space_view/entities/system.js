import { Star } from './star.js';
import { Planet } from './planet.js';
import { Ship } from './ship.js';
import { Wormhole } from './wormhole.js';
import { Colony } from './colony.js';
import { unpackData } from '../../../models/helpers.js'

export class System {

    constructor(systemData) {
        unpackData(systemData, this);
        this.stars = this.createRepresentations(systemData.stars, Star, this.name, this.id);
        this.planets = this.createRepresentations(systemData.planets, Planet, this.name, this.id);
        this.wormholes = this.createRepresentations(systemData.connections, Wormhole, this.name, this.id, systemData.position);
        this.ships = systemData.ships.map(ship => new Ship(ship, this.name, this.id)); // this pattern is leaner
        this.planets[0].colony = new Colony(1, this.planets[0], 1);
        if (this.planets[1]) {
            this.planets[1].colony = new Colony(2, this.planets[1], 1);
        }
        if (this.ships[1]) {
            this.ships[1].playerId = 2;
        }

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

    getEntity(type, id) {
        let entity = null;
        switch (type) {
            case 'star':
                entity = this.stars.find(x => x.id.toString() === id.toString());
                break;
            case 'planet':
                entity = this.planets.find(x => x.id.toString() === id.toString());
                break;
            case 'ship':
                entity = this.ships.find(x => x.id.toString() === id.toString());
                break;
            case 'wormhole':
                entity = this.wormholes.find(x => x.id.toString() === id.toString());
                break;
            default:
                throw new Error(`Invalid entity type: ${type}`);
        }
        return entity;
    }

    getWormholeTo(toId) {
        return this.wormholes.find(x => x.toId.toString() === toId.toString());
    }

    removeEntity(type, id) {
        switch (type) {
            case 'star':
                this.stars = this.stars.filter(x => x.id.toString() !== id.toString());
                break;
            case 'planet':
                this.planets = this.planets.filter(x => x.id.toString() !== id.toString());
                break;
            case 'ship':
                this.ships = this.ships.filter(x => x.id.toString() !== id.toString());
                break;
            case 'wormhole':
                this.wormholes = this.wormholes.filter(x => x.id.toString() !== id.toString());
                break;
            default:
                throw new Error(`Invalid entity type: ${type}`);
        }

    }

    addEntity(entity) {
        switch (entity.type) {
            case 'star':
                this.stars.push(entity);
                break;
            case 'planet':
                this.planets.push(entity);
                break;
            case 'ship':
                this.ships.push(entity);
                break;
            case 'wormhole':
                this.wormholes.push(entity);
                break;
            default:
                throw new Error(`Invalid entity type: ${entity.type}`);
        }
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