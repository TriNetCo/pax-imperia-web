import { StarName } from './starName.js';
import { SystemGenerator } from './systemGenerator.js';
import { getRandomNum } from './helpers.js'

export class Galaxy {

    constructor(galaxyWidgetSettings){
        // Should systems be called systemsData?
        this.systems = this.generateSystems(galaxyWidgetSettings);
        this.connections = this.generateConnections();
        this.addConnectionsToSystems();
    }

    // parameters of galaxies:
    //   How many systems
    //   How close can they be to each other? systemBuffer
    //   How far can they be from each other?
    //   how linear/ branchy (connectivity) is everything?
    generateSystems(c) {
        let systems = [];
        let starName = new StarName();

        // Define systems with coordinates
        for (let systemIndex = 0; systemIndex < c.systemCount; systemIndex++){
            let position = this.generateSystemPosition(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
            let i = 0;
            // Try maxPlacementAttempts times to find a system far enough away
            // from existing systems
            while (!this.isValidDistance(systems, position, c.systemBuffer)) {
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
            systems.push(systemData);
        }
        return systems;
    }

    generateSystemPosition(canvasWidth, canvasHeight, canvasBuffer) {
        // Generates system coordinates that aren't within canvasBuffer of the
        // edge of the canvas
        let x = getRandomNum(canvasBuffer, canvasWidth - canvasBuffer, 0);
        let y = getRandomNum(canvasBuffer, canvasHeight - canvasBuffer, 0);
        let z = getRandomNum(-8, 8, 2);
        return {x: x, y: y, z: z};
    }

    isValidDistance(systems, position, systemBuffer) {
        // Checks the distance from the position to every existing system and
        // returns true if the position is far enough away
        let isValid = systems.every( system => {
            let dist = Math.pow(Math.pow(system.position.x - position.x, 2) + Math.pow(system.position.y - position.y, 2), 0.5)
            if (dist < systemBuffer) {
                return false;
            } else {
                return true;
            }
        });
        return isValid;
    }

    generateConnections() {
        let connections = [];
        let connectedSystems = [];
        while (connectedSystems.length < this.systems.length && this.systems.length > 1){
            let minDist = Infinity;
            let minI;
            let minJ;

            // 1. Loop through all pairings of the systems to find the two closest systems
            for (let i = 0; i < this.systems.length - 1; i++) {
                for (let j = i + 1; j < this.systems.length; j++) {
                    // If this is our first connection, or if i is connected while j is not, or vice versa
                    // then we should see if they're a minimal distance from each other so that they can be
                    // connected.
                    if (        connections.length == 0
                            || (connectedSystems.includes(i) && !connectedSystems.includes(j))
                            || (connectedSystems.includes(j) && !connectedSystems.includes(i)) ) {
                        let dist = (this.systems[i].position.x - this.systems[j].position.x)**2 + (this.systems[i].position.y - this.systems[j].position.y)**2;
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

    addConnectionsToSystems() {
        this.connections.forEach( connection => {
            let i = connection[0];
            let j = connection[1];
            this.addConnectionToSystem(i, j);
            this.addConnectionToSystem(j, i);
        });
    }

    addConnectionToSystem(systemId, connectedSystemId) {
        let connectedSystem = this.systems[connectedSystemId];
        let connection = {id: connectedSystem.id,
                          name: connectedSystem.name,
                          position: connectedSystem.position
        };
        this.systems[systemId].connections.push(connection);
    }
}
