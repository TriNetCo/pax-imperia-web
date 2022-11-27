import { System } from './models/system.js';
import { SystemShape } from './models/systemShape.js';


// Globals
window.mouse = { x: 0, y: 0 };
window.canvas = document.querySelector("canvas");

// window.systems = generateSystems();

drawBackground();

window.requestAnimationFrame(redraw);

function generateSystems() {
    let systemA = new System(1, { x: 2, y: 2}, [2]    );
    let systemB = new System(2, { x: 4, y: 3}, [1,3,4]);
    let systemC = new System(3, { x: 6, y: 3}, [2,4]  );
    let systemD = new System(4, { x: 5, y: 2}, [2,3]  );
    let systemZ = new System(5, { x: 8, y: 3}, [3]    );

    return [ systemA, systemB, systemC, systemD, systemZ ];
}

function getSystemById(id) {
    for (let i = 0; i < window.systems.length; i++) {
        let system = window.systems[i];

        if (system.id == id)
            return system;
    }

    return undefined;
}

function redraw() {
    let cx = document.querySelector("canvas").getContext("2d");

    cx.strokeStyle = "blue";

    for (let i = 0; i < systems.length; i++) {
        let system = systems[i];
        let ss = system.getSystemShape();

        // Draw lines
        cx.beginPath();
        cx.strokeStyle = "orange";
        cx.lineWidth = 0.;            
        

        for (let i = 0; i < system.connections.length; i++) {
            cx.moveTo(ss.canvasX, ss.canvasY);
            let connectedSystem = getSystemById(system.connections[i]);
            if (connectedSystem == undefined) // this indicates a bug upstream from here in generating the systems correctly
                continue;
            let connectedSystemShape = connectedSystem.getSystemShape();
            cx.lineTo(connectedSystemShape.canvasX, connectedSystemShape.canvasY);
        }

        cx.stroke();
    }

    let nothingIsHovered = true;
    for (let i = 0; i < systems.length; i++) {
        let system = systems[i];
        let ss = system.getSystemShape();

        if (ss.isMouseHovering()) {
            systemNameLabel.innerHTML = system.id;
            nothingIsHovered = false;
        }

        drawDot(ss.x, ss.y, 8);

        // drawSystem(cx, ss);
    }
    if (nothingIsHovered) {
        systemNameLabel.innerHTML = "";
    }

    window.requestAnimationFrame(redraw);
}

function drawSystem(cx, ss) {
    cx.beginPath();
        let x = ss.x * ss.scale;
        let y = ss.y * ss.scale;
        cx.arc(x, y, ss.radius, 0, 2 * Math.PI);
        cx.fillStyle = "black";

        // printDebugMouseInfo(ss);
        if ( ss.isMouseHovering() ) {
            cx.strokeStyle = "green";
        }
        else
            cx.strokeStyle = "blue";

        cx.fill();
        cx.stroke();
}


function printDebugMouseInfo(ss) {
    console.log("window.mouse.x, y: " + window.mouse.x + ", " + window.mouse.y);
    console.log("ss.x, y: " + ss.x + ", " + ss.y);
}

function drawBackground() {
    let cx = document.querySelector("canvas").getContext("2d");

    cx.fillStyle = "Black";
    cx.fillRect(0, 0, canvas.width, canvas.height);

    // parameters of galaxies:
    //   How many systems
    //   how linear/ branchy (connectivity) is everything?
    
    window.systems = generateStars(20);
}

function generateStars(starCount){
    let cx = document.querySelector("canvas").getContext("2d");
    
    cx.fillStyle = "rgb(200, 200, 200)";

    let width = canvas.width;
    let height = canvas.height;

    window.systems = [];

    // Define systems/ coordinates
    for (let i = 0; i < starCount; i++){
        let x = Math.random() * width;
        let y = Math.random() * height;

        let system = new System(i+1, { x: x, y: y}, [] );
        systems.push(system);
    }

    systems = generateConnections(systems);

    return systems;
}

function generateConnections(systems){
    // Constellation Algorithm
    let connections = [];
    let connectedSystems = [];
    while (connectedSystems.length < systems.length){
        let minDist = Infinity;
        let minI;
        let minJ;
    
        // Find the shortest distance pair that includes a point that's not already connected
        for (let i = 0; i < systems.length - 1; i++){
            for (let j = i + 1; j < systems.length; j++){
                // console.log("i = " + i);
                // console.log("j = " + j);
                if (        connections.length == 0 
                        || (connectedSystems.includes(i) && !connectedSystems.includes(j)) 
                        || (connectedSystems.includes(j) && !connectedSystems.includes(i)) ){
                    let dist = (systems[i].x - systems[j].x)**2 + (systems[i].y - systems[j].y)**2;
                    if (dist < minDist) {
                        minDist = dist;
                        minI = i;
                        minJ = j;
                    };
                };
            };
        };
        // console.log("Min Distance: " + minDist);
        connections.push([minI,minJ])
        if (!connectedSystems.includes(minI)){
            connectedSystems.push(minI)
        }
        if (!connectedSystems.includes(minJ)){
            connectedSystems.push(minJ)
        }
        systems[minI].connections.push(systems[minJ].id)
        systems[minJ].connections.push(systems[minI].id)
    };


    return systems;
}


function generateConnectionsOld(systems){

    // Define Connections between systems
    systems.forEach( system => {
        let minDist = Infinity;
        let minSystem = undefined;
        // Loop through all the other systems without connections to find closest
        systems.forEach( otherSystem => {
            if (system.id != otherSystem.id && otherSystem.connections.length == 0) {
                let dist = (system.x - otherSystem.x)^2 + (system.y - otherSystem.y)^2;
                if (dist < minDist) {
                    minDist = dist;
                    minSystem = otherSystem;
                }
            }
        });
            
        if (minSystem != undefined) {
            system.connections.push(minSystem.id);
            minSystem.connections.push(system.id);
        }
    });

    return systems;
}

function drawDot(x, y, size){
    let cx = document.querySelector("canvas").getContext("2d");
    cx.fillRect(x, y, size, size);
    cx.fill();
}

function getTransformedPoint(x, y) {
    let cx = document.querySelector("canvas").getContext("2d");

    const transform = cx.getTransform();
    const transformedX = x - transform.e;
    const transformedY = y - transform.f;
    return { x: transformedX, y: transformedY };
}


/////////////////////
// DOM Connections //
/////////////////////

let systemNameLabel = document.getElementById("system-name");

// We can use our function with a canvas event
canvas.addEventListener('mousemove', event => {
    window.mouse = getTransformedPoint(event.offsetX, event.offsetY);
});

canvas.addEventListener('click', event => {
    window.mouse = getTransformedPoint(event.offsetX, event.offsetY);
    // check if we're clicking a star system
    systems.forEach( system => {
        let ss = system.getSystemShape();
        
        if (ss.isMouseHovering()) {
            alert('clicked system ' + system.id);

            window.location.href = "systems/" + system.id + ".html";
        }

    });


});

