import { System } from './models/system.js';

// generateSystems()
let systemA = {};
systemA.id = 1;
systemA.x = 2;
systemA.y = 2;
systemA.connections = [2]

let systemB = {};
systemB.id = 2;
systemB.x = 4;
systemB.y = 3;
systemA.connections = [1, 3]

let systemC = {};
systemC.id = 3;
systemC.x = 6;
systemC.y = 3;
systemA.connections = [2,4]

let systemZ = new System(4, 8, 3, [3]);

window.systems = [ systemA, systemB, systemC, systemZ ];

// Globals
window.mouse = { x: 0, y: 0 };
window.canvas = document.querySelector("canvas");


drawBackground();

window.requestAnimationFrame(redraw);






function redraw() {
    let cx = document.querySelector("canvas").getContext("2d");

    cx.strokeStyle = "blue";

    for (let i = 0; i < systems.length; i++) {
        let system = systems[i];

        let cx = document.querySelector("canvas").getContext("2d");

        class SystemShape {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.lengthOfRect = 20;
                this.scale = 22;
                this.radius = 10;
                this.offsetX = this.x * (this.scale-1) - this.radius;
                this.offsetY = this.y * (this.scale-1) - this.radius;
            }

            isMouseHovering() {
                return (window.mouse.x > ss.x + ss.offsetX
                     && window.mouse.x < ss.x + ss.offsetX + ss.lengthOfRect
                     && window.mouse.y > ss.y + ss.offsetY
                     && window.mouse.y < ss.y + ss.offsetY + ss.lengthOfRect);
            }
        }

        let ss = new SystemShape(system.x, system.y);

        // let lengthOfRect = 20;
        // let scale = 22;
        // let radius = 10;
        // let offsetX = system.x * (scale-1) - radius;
        // let offsetY = system.y * (scale-1) - radius;

        // Draw lines
        cx.beginPath();
        cx.strokeStyle = "orange";
        let thisX = ss.x + ss.offsetX + ss.radius;
        let thisY = ss.y + ss.offsetY + ss.radius;
        cx.moveTo(thisX, thisY);
        cx.lineTo(20, 20);
        cx.stroke();

        // Draw Circles
        drawSystem(cx, system, ss);
    }

    window.requestAnimationFrame(redraw);
}

function drawSystem(cx, system, ss) {
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
    
    drawStars(20);
}

function drawStars(starCount){
    let cx = document.querySelector("canvas").getContext("2d");
    
    cx.fillStyle = "rgb(200, 200, 200)";

    let width = canvas.width;
    let height = canvas.height;

    for (let i = 0; i < starCount; i++){
        let x = Math.random() * width;
        let y = Math.random() * height;
        
        drawDot(x, y, 2);
    }
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


// We can use our function with a canvas event
canvas.addEventListener('mousemove', event => {
    const transformedCursorPosition = getTransformedPoint(event.offsetX, event.offsetY);

    window.mouse = transformedCursorPosition;
    // window.systems[0].hovered = true;
    // console.log(window.systems[0].x);
    // console.log(transformedCursorPosition);
});

