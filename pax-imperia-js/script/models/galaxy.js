import { StarName } from './starName.js';
import { SystemGenerator } from './systemGenerator.js';
import { getRandomNum, seedRandomness } from './helpers.js';
import { System } from '../../script/widgets/space_view/entities/system.js';
import { Ship } from '../widgets/space_view/entities/ship.js';
import { Wormhole } from '../widgets/space_view/entities/wormhole.js';
import { Star } from '../widgets/space_view/entities/star.js';
import { Planet } from '../widgets/space_view/entities/planet.js';
import { Colony } from '../widgets/space_view/entities/colony.js';


export class Galaxy {

    /** @type {System[]} */
    systems;

    planetIds = [];

    colonyIds = [];
    nextColonyId = 0;

    shipIds = [];
    nextShipId = 0;

    /**
     * @param {Object} galaxyWidgetSettings Configurations passed to galaxy from the galaxyWidget.  If this parameter is omitted, systemsJson must be provided.
     * @param {number} galaxyWidgetSettings.canvasWidth Determines the area where stars can be placed
     * @param {number} galaxyWidgetSettings.canvasHeight Determines the area where stars can be placed
     * @param {number} galaxyWidgetSettings.canvasBuffer The padding between where the stars can be placed and the canvas perimeter
     * @param {number} galaxyWidgetSettings.maxPlacementAttempts description
     * @param {number} galaxyWidgetSettings.systemCount Number of systems to generate in the galaxy
     * @param {number} galaxyWidgetSettings.systemRadius description...
     * @param {number} galaxyWidgetSettings.systemBuffer description
     * @param {number} galaxyWidgetSettings.minStarSize description
     * @param {number} galaxyWidgetSettings.maxStarSize description
     * @param {number} galaxyWidgetSettings.minPlanetCount description
     * @param {number} galaxyWidgetSettings.maxPlanetCount description
     * @param {number} galaxyWidgetSettings.minPlanetSize description
     * @param {number} galaxyWidgetSettings.maxPlanetSize description
     */
    static generateFromConfig(galaxyWidgetSettings) {
        const galaxy = new Galaxy();
        galaxy.systems = galaxy.generateSystems(galaxyWidgetSettings);

        galaxy.collectEntityIds(galaxy.systems);

        return galaxy;
    }

    static seedRandomness(seed) {
        seedRandomness(seed);
    }

    /**
    * @param {string} systemsJson A JSON string representing the systemsJson data
    */
    static initializeFromJson(systemsJson) {
        const galaxy = new Galaxy();

        galaxy.systems = galaxy.deserializeGalaxyFromJson(systemsJson);

        return galaxy;
    }

    toJSON() {
        return JSON.stringify({
            nextShipId: this.nextShipId,
            nextPlanetId: this.nextPlanetId,
            nextColonyId: this.nextColonyId,
            systems: this.systems.map(system => system.toJSON())
        });
    }

    /**
     * Builds an array of important entity IDs for indexing purposes.  This is
     * used to quickly find entities by ID.
     *
     * @param {System[]} systems
     */
    collectEntityIds(systems) {
        for (const system of systems) {
            for (const ship of system.ships) {
                this.shipIds.push(ship.id);
            }
            for (const planet of system.planets) {
                this.planetIds.push(planet.id);
            }
            for (const colony of system.colonies) {
                this.colonyIds.push(colony.id);
            }
        }
    }

    getNextShipId() {
        const id = this.nextShipId;
        this.nextShipId += 1;
        return id;
    }

    getNextColonyId() {
        const id = this.nextColonyId;
        this.nextColonyId += 1;
        return id;
    }

    deserializeGalaxyFromJson(systemsJson) {
        const systems = [];
        const importData = JSON.parse(systemsJson);
        this.nextShipId = importData.nextShipId;
        this.nextPlanetId = importData.nextPlanetId;
        this.nextColonyId = importData.nextColonyId;

        importData.systems.forEach(systemData => {
            const system = new System(systemData);

            system.stars = systemData.stars.map(
                starData => new Star(starData));

            system.planets = systemData.planets.map(
                planetData => new Planet(planetData));

            system.colonies = systemData.colonies.map(
                colonyData => new Colony(colonyData));

            system.ships = systemData.ships.map(
                shipData => new Ship(shipData));

            system.wormholes = systemData.wormholes.map(
                wormholeData => new Wormhole(wormholeData));

            systems.push(system);
        });
        this.collectEntityIds(systems);

        return systems;
    }

    getSystem(id) {
        const system = this.systems.find(x => x.id.toString() === id.toString());
        return system;
    }

    getEntity(type, id) {
        let entity = null;
        for (const system of this.systems) {
            entity = system.getEntity(type, id);
            if (entity) {
                break;
            }
        }
        return entity;
    }

    /**
     * This function spawns a ship in the galaxy and adds it to the specified system.
     * Please note that this doesn't load the ship.  If that's desired, you'll need to
     * as the spaceViewLoader to do that.
     * @param {*} shipType
     * @param {*} systemId
     * @returns
     */
    spawnShip(shipConfig) {
        const ship = new Ship(shipConfig);

        const system = this.getSystem(shipConfig.systemId);
        system.addEntity(ship);
        return ship;
    }

    /**
     * Generates systems containing stars, planets, and ships
     *
     * @param {*} c
     * @returns {System[]}
     */
    generateSystems(c) {
        let systems = [];
        let starName = new StarName();

        const systemGenerator = new SystemGenerator(c);

        for (let i = 0; i < c.systemCount; i++) {
            // Define systems with coordinates
            let position = this.generateSystemPosition(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
            let attempt = 0;
            // Try maxPlacementAttempts times to find a system far enough away
            // from existing systems
            while (!this.isValidDistance(systems, position, c.systemBuffer)) {
                position = this.generateSystemPosition(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
                attempt += 1;
                if (attempt == c.maxPlacementAttempts) {
                    let errorMsg = 'Generating stars without buffer';
                    console.log(errorMsg);
                    break;
                }
            }
            const systemIndex = i;
            const system = systemGenerator.generateSystem(systemIndex, position, starName.pick());
            systems.push(system);
        }

        this.nextColonyId = systemGenerator.nextColonyId;
        this.nextShipId = systemGenerator.nextShipId;

        //////////////////
        // Do Wormholes //
        //////////////////

        const connections = this.generateConnections(systems);
        this.addWormholesToSystems(systems, connections);

        return systems;
    }

    generateSystemPosition(canvasWidth, canvasHeight, canvasBuffer) {
        // Generates system coordinates that aren't within canvasBuffer of the
        // edge of the canvas
        let x = getRandomNum(canvasBuffer, canvasWidth - canvasBuffer, 0);
        let y = getRandomNum(canvasBuffer, canvasHeight - canvasBuffer, 0);
        let z = getRandomNum(-8, 8, 2);
        return { x: x, y: y, z: z };
    }

    isValidDistance(systemsData, position, systemBuffer) {
        // Checks the distance from the position to every existing system and
        // returns true if the position is far enough away
        let isValid = systemsData.every(systemData => {
            let dist = Math.pow(
                Math.pow(systemData.position.x - position.x, 2) +
                Math.pow(systemData.position.y - position.y, 2),
                0.5);
            if (dist < systemBuffer) {
                return false;
            } else {
                return true;
            }
        });
        return isValid;
    }

    /**
     *
     * @param {System[]} systems
     * @returns {number[][]}
     */
    generateConnections(systems) {
        let connections = [];
        let connectedSystems = [];
        while (connectedSystems.length < systems.length && systems.length > 1) {
            let minDist = Infinity;
            let minI;
            let minJ;

            // 1. Loop through all pairings of the systems to find the two closest systems
            for (let i = 0; i < systems.length - 1; i++) {
                for (let j = i + 1; j < systems.length; j++) {
                    // If this is our first connection, or if i is connected while j is not, or vice versa
                    // then we should see if they're a minimal distance from each other so that they can be
                    // connected.
                    if (connections.length == 0
                        || (connectedSystems.includes(i) && !connectedSystems.includes(j))
                        || (connectedSystems.includes(j) && !connectedSystems.includes(i))) {
                        let dist = (systems[i].position.x - systems[j].position.x) ** 2 +
                            (systems[i].position.y - systems[j].position.y) ** 2;
                        if (dist < minDist) {
                            minDist = dist;
                            minI = systems[i].id;
                            minJ = systems[j].id;
                        };
                    };
                };
            };
            connections.push([minI, minJ])
            if (!connectedSystems.includes(minI)) {
                connectedSystems.push(minI)
            }
            if (!connectedSystems.includes(minJ)) {
                connectedSystems.push(minJ)
            }
        };

        return connections;
    }

    /**
     * Constructs a wormhole entity for each endpoint found in the connections
     * array and adds it to the appropriate system.
     *
     * @param {System[]} systems
     * @param {number[][]} connections - e.g. [[0,1], [1,0], [0,2], [2,0], [2,3]]
     */
    addWormholesToSystems(systems, connections) {
        connections.forEach(connection => {
            const a = connection[0];
            const b = connection[1];
            this.addWormholeToSystem(systems, a, b);
            this.addWormholeToSystem(systems, b, a);
        });
    }

    addWormholeToSystem(systems, srcSystemId, dstSystemId) {
        const srcSystem = systems[srcSystemId];
        const dstSystem = systems[dstSystemId];

        const wormhole = new Wormhole({ id: srcSystemId + '_' + dstSystem.id,
                                        fromId: srcSystemId,
                                        toId: dstSystem.id,
                                        name: dstSystem.name,
                                        srcSystemPosition: srcSystem.position,
                                        dstSystemPosition: dstSystem.position });

        srcSystem.wormholes.push(wormhole);
    }
}
