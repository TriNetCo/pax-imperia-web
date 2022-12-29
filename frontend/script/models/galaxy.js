import { StarName } from './starName.js';
import { SystemGenerator } from './systemGenerator.js';

export class Galaxy {

    constructor(galaxyWidgetSettings){
        console.log("Constructing galaxy");
        console.log('Constructor system count: ' + galaxyWidgetSettings.systemCount)
        // Should systems be called systemsData?
        this.systems = this.generateSystems(galaxyWidgetSettings);
        this.connections = this.generateConnections();
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
            let point = this.generateSystemXY(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
            let i = 0;
            // Try maxPlacementAttempts times to find a system far enough away
            // from existing systems
            while (!this.isValidDistance(systems, point, c.systemBuffer)) {
                console.log("retrying placement");
                point = this.generateSystemXY(c.canvasWidth, c.canvasHeight, c.canvasBuffer);
                i = i + 1;
                if (i == c.maxPlacementAttempts) {
                    let errorMsg = 'Generating stars without buffer';
                    console.log(errorMsg);
                    break;
                }
            }
            let systemGenerator = new SystemGenerator(systemIndex, point, starName.pick(), c.systemRadius, c);
            let systemData = systemGenerator.generateData();
            systems.push(systemData);
        }
        return systems;
    }

    generateSystemXY(canvasWidth, canvasHeight, canvasBuffer) {
        // Generates system coordinates that aren't within canvasBuffer of the
        // edge of the canvas
        let x = Math.round(Math.random() * (canvasWidth - canvasBuffer * 2) + canvasBuffer);
        let y = Math.round(Math.random() * (canvasHeight - canvasBuffer * 2) + canvasBuffer);
        return {x: x, y: y};
    }

    isValidDistance(systems, point, systemBuffer) {
        // Checks the distance from the point to every existing system and
        // returns true if the point is far enough away
        let isValid = systems.every( system => {
            let dist = Math.pow(Math.pow(system.x - point.x, 2) + Math.pow(system.y - point.y, 2), 0.5)
            if (dist < systemBuffer) {
                return false;
            } else {
                return true;
            }
        });
        return isValid;
    }

    generateConnections(){
        let connections = [];
        let connectedSystems = [];
        while (connectedSystems.length < this.systems.length && this.systems.length > 1){
            console.log("Looped");
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
                        let dist = (this.systems[i].x - this.systems[j].x)**2 + (this.systems[i].y - this.systems[j].y)**2;
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

}
