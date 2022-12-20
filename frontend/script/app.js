import { GalaxyWidget } from './models/galaxyWidget.js';

let systemCount = 100;
let systemRadius = 5;
let systemBuffer = 30;
let canvasBuffer = 15;

const canvas = document.getElementById("galaxy-canvas-large");
const regenButton = document.getElementById("galaxy-regenerate-button");
const systemCountSlider = document.getElementById("system-count-slider");
const galaxyWidget = new GalaxyWidget(canvas);

galaxyWidget.beginGame(systemCount, systemRadius, systemBuffer, canvasBuffer);

regenButton.onclick = function() {galaxyWidget.beginGame(systemCountSlider.value, systemRadius, systemBuffer, canvasBuffer);}

function draw() {
    galaxyWidget.draw();
    window.requestAnimationFrame(draw);
}

draw();
