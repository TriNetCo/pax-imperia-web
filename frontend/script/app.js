import { GalaxyWidget } from './models/galaxyWidget.js';
import { GameSettings } from './gameSettings.js';

const canvas = document.getElementById("galaxy-canvas-large");
const regenButton = document.getElementById("galaxy-regenerate-button");
const systemCountSlider = document.getElementById("system-count-slider");

let galaxyWidgetSettings = GameSettings.galaxyWidget;

systemCountSlider.value = galaxyWidgetSettings.systemCount;

let galaxyWidget;
function generateGalaxy() {
    galaxyWidgetSettings.systemCount = systemCountSlider.value;
    galaxyWidget = new GalaxyWidget(galaxyWidgetSettings);
    galaxyWidget.beginGame(canvas);
}

generateGalaxy();

regenButton.onclick = function() { generateGalaxy(); }

function draw() {
    galaxyWidget.draw();
    window.requestAnimationFrame(draw);
}

draw();
