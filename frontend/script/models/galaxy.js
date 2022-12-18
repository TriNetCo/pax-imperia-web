import { StarName } from './starName.js';
import { System } from './system.js';

export class Galaxy {

    constructor(canvasWidth, canvasHeight, systemCount = 100){
        this.systemCount = systemCount
        this.systems = this.generateSystems(canvasWidth, canvasHeight, systemCount);
        this.connections = this.generateConnections();
        console.log("Constructing galaxy");
    }
    
    generateConnections(){
        let output = [];
        let connections = [];
        let connectedSystems = [];
        while (connectedSystems.length < this.systems.length){
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

    // parameters of galaxies:
    //   How many systems
    //   How close can they be to each other?
    //   How far can they be from each other?
    //   how linear/ branchy (connectivity) is everything?
    generateSystems(canvasWidth, canvasHeight, systemCount) {
        let radius = 5;
        let proximityRadius = radius * 3;

        let systems = [];
        let starName = new StarName();

        // Define systems/ coordinates
        for (let i = 0; i < systemCount; i++){
            let point = this.generateSystemXY(canvasWidth, canvasHeight, radius);
            let validDistance = this.isValidDistance(systems, point, proximityRadius);
            let iter = 0
            // Try 10 times to find a system far enough away from existing systems
            while (!validDistance && iter <= 10) {
                point = this.generateSystemXY(canvasWidth, canvasHeight, radius);
                validDistance = this.isValidDistance(systems, point, proximityRadius);
                iter = iter + 1;
            }
            let system = new System(i, point, starName.pick(), radius);
            systems.push(system);
        }
        return systems;
    }

    generateSystemXY(canvasWidth, canvasHeight, radius) {
        // Make sure that no systems are too close to the edge of the canvas
        let buffer = radius * 2
        let x = Math.round(Math.random() * (canvasWidth - buffer * 2) + buffer);
        let y = Math.round(Math.random() * (canvasHeight - buffer * 2) + buffer);
        return {x: x, y: y};
    }

    isValidDistance(systems, point, proximityRadius) {
        // Check the distance from the point to every system
        let isValid = systems.every( system => {
            let dist = Math.pow(Math.pow(system.x - point.x, 2) + Math.pow(system.y - point.y, 2), 0.5)
            if (dist < proximityRadius) {
                return false;
            } else {
                return true;
            }
        });
        return isValid;
    }
    
}
