import { GalaxyWidget } from './models/galaxyWidget.js';

const canvas = document.getElementById("galaxy-canvas-large");
const regenButton = document.getElementById("galaxy-regenerate-button");
const systemCountSlider = document.getElementById("system-count-slider");

let width = 800;
let height = 400;
let systemCount = systemCountSlider.value;
let systemRadius = 5;
let systemBuffer = 30;
let canvasBuffer = 15;

let galaxyWidget;
function generateGalaxy() {
    systemCount = systemCountSlider.value;
    galaxyWidget = new GalaxyWidget(width, height, systemCount, systemRadius, systemBuffer, canvasBuffer);
    galaxyWidget.beginGame(canvas);
}

generateGalaxy();

regenButton.onclick = function() { generateGalaxy(); }

function draw() {
    galaxyWidget.draw();
    window.requestAnimationFrame(draw);
}

draw();
