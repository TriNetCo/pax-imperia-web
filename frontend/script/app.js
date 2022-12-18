import { GalaxyWidget } from './models/galaxyWidget.js';

const canvas = document.getElementById("galaxy-canvas-large");

const galaxyWidget = new GalaxyWidget(canvas);
galaxyWidget.beginGame();

function draw() {
    galaxyWidget.draw();
    window.requestAnimationFrame(draw);
}

draw();
