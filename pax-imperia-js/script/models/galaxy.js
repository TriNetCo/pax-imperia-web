import { StarName } from './starName.js';
import { SystemGenerator } from './systemGenerator.js';
import { getRandomNum, seedRandomness } from './helpers.js';
import { System } from '../../script/widgets/space_view/entities/system.js';
import { Ship } from '../widgets/space_view/entities/ship.js';


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
        const systemsData = galaxy.generateSystems(galaxyWidgetSettings);
        galaxy.systems = galaxy.unpackSystemsData(systemsData);

        const connections = galaxy.generateConnections(systemsData);
        galaxy.addConnectionsToSystems(systemsData, connections);

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
        const systemsData = JSON.parse(systemsJson);
        galaxy.systems = galaxy.unpackSystemsData(systemsData);
        return galaxy;
    }

    collectIds(systems) {
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

    toJson() {
        return JSON.stringify(this.systems);
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

    unpackSystemsData(systemsData) {
        const systems = [];
        for (const systemData of systemsData) {
            const system = new System(systemData);
            systems.push(system);
        }
        this.collectIds(systems);

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

    ///////////////////////////////
    // Generate New Systems Data //
    ///////////////////////////////

    // parameters of galaxies:
    //   How many systems
    //   How close can they be to each other? systemBuffer
    //   How far can they be from each other?
    //   how linear/ branchy (connectivity) is everything?
    generateSystems(c) {
        let systemsData = [];
        let starName = new StarName();

        const systemGenerator = new SystemGenerator(c);

        // Define systems with coordinates
        for (let i = 0; i < c.systemCount; i++) {
            let position = this.generateSystemPosition(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
            let attempt = 0;
            // Try maxPlacementAttempts times to find a system far enough away
            // from existing systems
            while (!this.isValidDistance(systemsData, position, c.systemBuffer)) {
                position = this.generateSystemPosition(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
                attempt += 1;
                if (attempt == c.maxPlacementAttempts) {
                    let errorMsg = 'Generating stars without buffer';
                    console.log(errorMsg);
                    break;
                }
            }
            const systemIndex = i;
            const systemData = systemGenerator.generateSystem(systemIndex, position, starName.pick());
            systemsData.push(systemData);
        }

        this.nextColonyId = systemGenerator.nextColonyId;
        this.nextShipId = systemGenerator.nextShipId;

        return systemsData;
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

    generateConnections(systemsData) {
        let connections = [];
        let connectedSystems = [];
        while (connectedSystems.length < systemsData.length && systemsData.length > 1) {
            let minDist = Infinity;
            let minI;
            let minJ;

            // 1. Loop through all pairings of the systems to find the two closest systems
            for (let i = 0; i < systemsData.length - 1; i++) {
                for (let j = i + 1; j < systemsData.length; j++) {
                    // If this is our first connection, or if i is connected while j is not, or vice versa
                    // then we should see if they're a minimal distance from each other so that they can be
                    // connected.
                    if (connections.length == 0
                        || (connectedSystems.includes(i) && !connectedSystems.includes(j))
                        || (connectedSystems.includes(j) && !connectedSystems.includes(i))) {
                        let dist = (systemsData[i].position.x - systemsData[j].position.x) ** 2 +
                            (systemsData[i].position.y - systemsData[j].position.y) ** 2;
                        if (dist < minDist) {
                            minDist = dist;
                            minI = systemsData[i].id;
                            minJ = systemsData[j].id;
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

    addConnectionsToSystems(systemsData, connections) {
        connections.forEach(connection => {
            const i = connection[0];
            const j = connection[1];
            this.addConnectionToSystem(systemsData, i, j);
            this.addConnectionToSystem(systemsData, j, i);
        });
    }

    addConnectionToSystem(systemsData, systemId, connectedSystemId) {
        const connectedSystemData = systemsData[connectedSystemId];
        const connection = {
            id: systemId + '_' + connectedSystemData.id,
            fromId: systemId,
            toId: connectedSystemData.id,
            name: connectedSystemData.name,
            toPosition: connectedSystemData.position
        };
        systemsData[systemId].connections.push(connection);
    }
}
