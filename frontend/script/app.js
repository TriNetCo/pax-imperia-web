import { Galaxy } from './models/galaxy.js';


/////////////
// Globals //
/////////////

window.mouse = { x: 0, y: 0 };
let canvas = document.querySelector("canvas");
let cx = document.querySelector("canvas").getContext("2d");
let systemNameLabel = document.getElementById("system-name");

///////////////
// Draw Loop //
///////////////

function drawLoop() {
    cx.strokeStyle = "blue";

    for (let i = 0; i < galaxy.systems.length; i++) {
        let system = galaxy.systems[i];
        let ss = system.getSystemShape();

        // Draw lines
        cx.beginPath();
        cx.strokeStyle = "orange";
        cx.lineWidth = 0.;            
        
        for (let i = 0; i < system.connections.length; i++) {
            cx.moveTo(ss.canvasX, ss.canvasY);
            let connectedSystem = galaxy.getSystemById(system.connections[i]);
            if (connectedSystem == undefined) // FIXME: this indicates a bug upstream from here in generating the systems correctly
                continue;
            let connectedSystemShape = connectedSystem.getSystemShape();
            cx.lineTo(connectedSystemShape.canvasX, connectedSystemShape.canvasY);
        }

        cx.stroke();
    }

    let nothingIsHovered = true;
    for (let i = 0; i < galaxy.systems.length; i++) {
        let system = galaxy.systems[i];
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


///////////////////////
// Drawing Functions //
///////////////////////

function drawBackground() {
    cx.fillStyle = "Black";
    cx.fillRect(0, 0, canvas.width, canvas.height);
    cx.fillStyle = "rgb(200, 200, 200)";
}

function drawDot(x, y, size){
    cx.fillRect(x, y, size, size);
    cx.fill();
}


/////////////////////
// DOM Connections //
/////////////////////

// We can use our function with a canvas event
canvas.addEventListener('mousemove', e => {
    window.mouse =  { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener('click', event => {
    window.mouse = { x: event.offsetX, y: event.offsetY };

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

const starCount = 100;
const galaxy = new Galaxy(canvas.width, canvas.height, starCount);

drawBackground();
drawLoop();

window.cx = cx;
window.systems = galaxy.systems;
