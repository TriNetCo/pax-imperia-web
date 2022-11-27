import { System } from './models/system.js';
import { StarName } from './models/starName.js'


/////////////
// Globals //
/////////////

window.mouse = { x: 0, y: 0 };
let canvas = document.querySelector("canvas");
let cx = document.querySelector("canvas").getContext("2d");
let systemNameLabel = document.getElementById("system-name");


/////////////////////
// DOM Connections //
/////////////////////

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

            window.location.href = "systems/" + 1 + ".html";
        }

    });

});


//////////
// main //
//////////

drawBackground();
// window.requestAnimationFrame(drawLoop);
drawLoop();

function getSystemById(id) {
    for (let i = 0; i < window.systems.length; i++) {
        let system = window.systems[i];

        if (system.id == id)
            return system;
    }

    return undefined;
}

function drawLoop() {
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
            if (connectedSystem == undefined) // FIXME: this indicates a bug upstream from here in generating the systems correctly
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
            systemNameLabel.innerHTML = system.name;
            nothingIsHovered = false;
        }

        drawDot(ss.x, ss.y, 8);

        // drawSystem(cx, ss);
    }
    if (nothingIsHovered) {
        systemNameLabel.innerHTML = "";
    }

    window.requestAnimationFrame(drawLoop);
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
    cx.fillStyle = "Black";
    cx.fillRect(0, 0, canvas.width, canvas.height);

    // parameters of galaxies:
    //   How many systems
    //   how linear/ branchy (connectivity) is everything?
    
    window.systems = generateStars(20);
}

function generateStars(starCount){
    cx.fillStyle = "rgb(200, 200, 200)";

    let width = canvas.width;
    let height = canvas.height;

    window.systems = [];

    let starName = new StarName();

    // Define systems/ coordinates
    for (let i = 0; i < starCount; i++){
        let x = Math.random() * width;
        let y = Math.random() * height;

        let system = new System(i+1, { x: x, y: y}, starName.pick() );
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
        console.log("Looped");
        let minDist = Infinity;
        let minI;
        let minJ;
    
        // 1. Loop through all pairings of the systems to find the two closest systems
        for (let i = 0; i < systems.length - 1; i++) {
            for (let j = i + 1; j < systems.length; j++) {
                // console.log("i = " + i);
                // console.log("j = " + j);
                // If this is our first connection, or if i is connected while j is not, or vice versa
                // then we should see if they're a minimal distance from each other so that they can be
                // connected.
                if (        connections.length == 0 
                        || (connectedSystems.includes(i) && !connectedSystems.includes(j)) 
                        || (connectedSystems.includes(j) && !connectedSystems.includes(i)) ) {
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

function drawDot(x, y, size){
    cx.fillRect(x, y, size, size);
    cx.fill();
}

function getTransformedPoint(x, y) {
    const transform = cx.getTransform();
    const transformedX = x - transform.e;
    const transformedY = y - transform.f;
    return { x: transformedX, y: transformedY };
}


