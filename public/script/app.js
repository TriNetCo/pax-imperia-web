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

    for (let i = 0; i < systems.length; i++) {
        let ss = systems[i].getSystemShape();

        drawDot(ss.x, ss.y, 2);


        // drawSystem(cx, ss);
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
        if ( ss.isMouseHovering() )
            cx.strokeStyle = "green";
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

    // Define Connections between systems
    systems.forEach( system => {
        let connectingSystemId = 2+system.id;
        let connectingSystem = getSystemById(connectingSystemId);

        if (connectingSystem != undefined) { // if the connectingSystem exists
            console.log(connectingSystem.id);
            system.connections.push(connectingSystem.id);
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
            window.location.href = "systems/" + system.id + ".html";
        }

    });


});

