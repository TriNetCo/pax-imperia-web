import { GalaxyWidget } from './widgets/galaxy/galaxyWidget.js';
import { GameSettings } from './gameSettings.js';
import { Galaxy } from './models/galaxy.js';

const canvas = document.getElementById("galaxy-canvas-large");
const regenButton = document.getElementById("galaxy-regenerate-button");
const systemCountSlider = document.getElementById("system-count-slider");
const systemBufferSlider = document.getElementById("system-buffer-slider");

let config = GameSettings.galaxyWidget;

const systemClickHandler = (path) => {
    window.location.href = path + ".html";
}

systemCountSlider.value = config.systemCount;
systemBufferSlider.value = config.systemBuffer;

systemCountSlider.onchange = generateGalaxy;
systemBufferSlider.onchange = generateGalaxy;

let galaxyWidget;
function generateGalaxy() {
    config.systemCount = systemCountSlider.value;
    config.systemBuffer = systemBufferSlider.value;
    // Clear lower console text
    let lowerConsoleDiv = document.getElementById("lower-console");
    lowerConsoleDiv.innerHTML = "";

    let gameData = {
        galaxy: new Galaxy(config)
    };

    galaxyWidget = new GalaxyWidget(config, galaxy);
    galaxyWidget.beginGame(canvas, systemClickHandler);
}

generateGalaxy();

regenButton.onclick = function() { generateGalaxy(); }

function draw() {
    galaxyWidget.draw();
    window.requestAnimationFrame(draw);
}

draw();
