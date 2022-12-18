import { StarName } from './starName.js';
import { System } from './system.js';

export class Galaxy {

    constructor(canvasWidth, canvasHeight, starCount = 100){
        this.starCount = starCount
        this.systems = this.generateStars(canvasWidth, canvasHeight, starCount);
        this.connections = this.generateConnections();
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
    generateStars(canvasWidth, canvasHeight, starCount){
        let systems = [];
        let starName = new StarName();
    
        // Define systems/ coordinates
        for (let i = 0; i < starCount; i++){
            let x = Math.random() * canvasWidth;
            let y = Math.random() * canvasHeight;
    
            let system = new System(i, { x: x, y: y}, starName.pick() );
            systems.push(system);
        }
        return systems
    }

    getSystemById(id) {
        for (let i = 0; i < this.systems.length; i++) {
            let system = this.systems[i];
    
            if (system.id == id)
                return system;
        }
    
        return undefined;
    }
    
}