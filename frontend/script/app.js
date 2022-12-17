import { Galaxy } from './models/galaxy.js';
import { GalaxyDrawer } from './models/galaxyDrawer.js';

/////////////
// Globals //
/////////////

window.mouse = { x: 0, y: 0 };
let canvas = document.querySelector("canvas");
let cx = canvas.getContext("2d");
let systemNameLabel = document.getElementById("system-name");

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

GalaxyDrawer.drawLoop(cx, galaxy, systemNameLabel);

window.cx = cx;
window.systems = galaxy.systems;
