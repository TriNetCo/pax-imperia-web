import { Star } from './star.js';
import { Planet } from './planet.js';
import { Ship } from './ship.js';
import { Wormhole } from './wormhole.js';
import { Colony } from './colony.js';

export class System {

    /** @type {Star[]} */
    stars;
    /** @type {Planet[]} */
    planets;
    /** @type {Wormhole[]} */
    wormholes;
    /** @type {Ship[]} */
    ships;
    /** @type {Colony[]} */
    colonies;

    constructor(systemData) {
        this.name = systemData.name;
        this.id = systemData.id;
        this.position = systemData.position;
        this.radius = systemData.radius;

        // Entities
        this.wormholes = systemData.connections;
        this.planets = systemData.planets;
        this.stars = systemData.stars;
        this.ships = systemData.ships;
        this.colonies = systemData.colonies || [];
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

}
