import { StarName } from './starName.js';
import { SystemGenerator } from './systemGenerator.js';
import { getRandomNum } from './helpers.js';
import { System } from '../../script/widgets/space_view/entities/system.js'
// import { packData, unpackData } from './helpers.js';


export class Galaxy {

    constructor(galaxyWidgetSettings = null, systemsJson = ""){
        // generate new systemsData or use given systemsJson
        let systemsData = [];
        if (systemsJson === "") {
            // galaxyWidgetSettings should not be null
            systemsData = this.generateSystems(galaxyWidgetSettings);
            const connections = this.generateConnections(systemsData);
            this.addConnectionsToSystems(systemsData, connections);
        } else {
            systemsData = JSON.parse(systemsJson);
        }
        this.systems = this.unpackSystemsData(systemsData);
    }

    unpackSystemsData(systemsData) {
        const systems = []
        for (const systemData of systemsData) {
            const system = new System(systemData);
            systems.push(system);
        }
        return systems;
    }

    replaceSystemsData(systemsJson) {
        if (!systemsJson || systemsJson == '') {
            alert('systems JSON not provided');
        }
        const systemsData = JSON.parse(systemsJson);
        this.systems = this.unpackSystemsData(systemsData);
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

        // Define systems with coordinates
        for (let systemIndex = 0; systemIndex < c.systemCount; systemIndex++){
            let position = this.generateSystemPosition(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
            let i = 0;
            // Try maxPlacementAttempts times to find a system far enough away
            // from existing systems
            while (!this.isValidDistance(systemsData, position, c.systemBuffer)) {
                position = this.generateSystemPosition(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
                i = i + 1;
                if (i == c.maxPlacementAttempts) {
                    let errorMsg = 'Generating stars without buffer';
                    console.log(errorMsg);
                    break;
                }
            }
            let systemGenerator = new SystemGenerator(systemIndex, position, starName.pick(), c.systemRadius, c);
            let systemData = systemGenerator.generateData();
            systemsData.push(systemData);
        }
        return systemsData;
    }

    generateSystemPosition(canvasWidth, canvasHeight, canvasBuffer) {
        // Generates system coordinates that aren't within canvasBuffer of the
        // edge of the canvas
        let x = getRandomNum(canvasBuffer, canvasWidth - canvasBuffer, 0);
        let y = getRandomNum(canvasBuffer, canvasHeight - canvasBuffer, 0);
        let z = getRandomNum(-8, 8, 2);
        return {x: x, y: y, z: z};
    }

    isValidDistance(systemsData, position, systemBuffer) {
        // Checks the distance from the position to every existing system and
        // returns true if the position is far enough away
        let isValid = systemsData.every( systemData => {
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
        while (connectedSystems.length < systemsData.length && systemsData.length > 1){
            let minDist = Infinity;
            let minI;
            let minJ;

            // 1. Loop through all pairings of the systems to find the two closest systems
            for (let i = 0; i < systemsData.length - 1; i++) {
                for (let j = i + 1; j < systemsData.length; j++) {
                    // If this is our first connection, or if i is connected while j is not, or vice versa
                    // then we should see if they're a minimal distance from each other so that they can be
                    // connected.
                    if (        connections.length == 0
                            || (connectedSystems.includes(i) && !connectedSystems.includes(j))
                            || (connectedSystems.includes(j) && !connectedSystems.includes(i)) ) {
                        let dist = (systemsData[i].position.x - systemsData[j].position.x)**2 +
                            (systemsData[i].position.y - systemsData[j].position.y)**2;
                        if (dist < minDist) {
                            minDist = dist;
                            minI = i;
                            minJ = j;
                        };
                    };
                };
            };
            connections.push([minI,minJ])
            if (!connectedSystems.includes(minI)){
                connectedSystems.push(minI)
            }
            if (!connectedSystems.includes(minJ)){
                connectedSystems.push(minJ)
            }
        };
        return connections;
    }

    addConnectionsToSystems(systemsData, connections) {
        connections.forEach( connection => {
            const i = connection[0];
            const j = connection[1];
            this.addConnectionToSystem(systemsData, i, j);
            this.addConnectionToSystem(systemsData, j, i);
        });
    }

    addConnectionToSystem(systemsData, systemId, connectedSystemId) {
        const connectedSystemData = systemsData[connectedSystemId];
        const connection = {id: connectedSystemData.id,
                          name: connectedSystemData.name,
                          position: connectedSystemData.position
        };
        systemsData[systemId].connections.push(connection);
    }
}
