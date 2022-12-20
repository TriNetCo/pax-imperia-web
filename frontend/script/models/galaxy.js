import { StarName } from './starName.js';
import { System } from './system.js';

export class Galaxy {

    constructor(galaxyWidgetSettings){
        console.log("Constructing galaxy");
        console.log('Constructor system count: ' + galaxyWidgetSettings.systemCount)
        this.systems = this.generateSystems(galaxyWidgetSettings);
        this.connections = this.generateConnections();
    }

    // parameters of galaxies:
    //   How many systems
    //   How close can they be to each other? systemBuffer
    //   How far can they be from each other?
    //   how linear/ branchy (connectivity) is everything?
    generateSystems(galaxyWidgetSettings) {
        let canvasWidth = galaxyWidgetSettings.canvasWidth;
        let canvasHeight = galaxyWidgetSettings.canvasHeight;
        let systemCount = galaxyWidgetSettings.systemCount;
        let systemRadius = galaxyWidgetSettings.systemRadius;
        let systemBuffer = galaxyWidgetSettings.systemBuffer;
        let canvasBuffer = galaxyWidgetSettings.canvasBuffer;
        let maxIterations = galaxyWidgetSettings.maxPlacementAttempts;
        let systems = [];
        let starName = new StarName();

        let lowerConsoleDiv = document.getElementById("lower-console");
        if (lowerConsoleDiv) lowerConsoleDiv.innerHTML = "";


        // Define systems with coordinates
        for (let i = 0; i < systemCount; i++){
            let point = this.generateSystemXY(canvasWidth, canvasHeight, canvasBuffer);
            let iter = 0
            // Try n times to find a system far enough away from existing systems
            while (!this.isValidDistance(systems, point, systemBuffer)) {
                console.log("retrying placement");
                point = this.generateSystemXY(canvasWidth, canvasHeight, canvasBuffer);
                iter = iter + 1;
                if (iter == maxIterations){
                    let errorMsg = 'Generating stars without buffer';
                    console.log(errorMsg);
                    if (lowerConsoleDiv) lowerConsoleDiv.innerHTML = errorMsg;
                    break;
                }
            }
            let system = new System(i, point, starName.pick(), systemRadius);
            systems.push(system);
        }
        return systems;
    }

    generateSystemXY(canvasWidth, canvasHeight, canvasBuffer) {
        // Make sure that no systems are too close to the edge of the canvas
        let x = Math.round(Math.random() * (canvasWidth - canvasBuffer * 2) + canvasBuffer);
        let y = Math.round(Math.random() * (canvasHeight - canvasBuffer * 2) + canvasBuffer);
        return {x: x, y: y};
    }

    isValidDistance(systems, point, systemBuffer) {
        // Check the distance from the point to every system
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
