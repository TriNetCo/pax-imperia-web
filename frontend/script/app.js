import { GalaxyWidget } from './models/galaxyWidget.js';
import { GameSettings } from './gameSettings.js';

const canvas = document.getElementById("galaxy-canvas-large");
const regenButton = document.getElementById("galaxy-regenerate-button");
const systemCountSlider = document.getElementById("system-count-slider");
const systemBufferSlider = document.getElementById("system-buffer-slider");

let galaxyWidgetSettings = GameSettings.galaxyWidget;

const systemClickHandler = (path) => {
    window.location.href = path + ".html";
}

systemCountSlider.value = galaxyWidgetSettings.systemCount;
systemBufferSlider.value = galaxyWidgetSettings.systemBuffer;

systemCountSlider.onchange = generateGalaxy;
systemBufferSlider.onchange = generateGalaxy;

let galaxyWidget;
function generateGalaxy() {
    galaxyWidgetSettings.systemCount = systemCountSlider.value;
    galaxyWidgetSettings.systemBuffer = systemBufferSlider.value;
    galaxyWidget = new GalaxyWidget(galaxyWidgetSettings);
    galaxyWidget.beginGame(canvas, systemClickHandler);
}

generateGalaxy();

regenButton.onclick = function() { generateGalaxy(); }

function draw() {
    galaxyWidget.draw();
    window.requestAnimationFrame(draw);
}

draw();
