import { GalaxyWidget } from './widgets/galaxy/galaxyWidget.js';
import { GameSettings } from './gameSettings.js';
import { Galaxy } from './models/galaxy.js';
import {GameStateInterface} from './gameStateInterface/gameStateInterface';

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

const websocket = new WebSocket('ws://localhost:3001/websocket');

let galaxyWidget;
function generateGalaxy() {
    config.systemCount = systemCountSlider.value;
    config.systemBuffer = systemBufferSlider.value;
    // Clear lower console text
    let lowerConsoleDiv = document.getElementById("lower-console");
    lowerConsoleDiv.innerHTML = "";

    const galaxy = Galaxy.generateFromConfig(config);

    const gameStateInterface = new GameStateInterface({galaxy, websocket});
    gameStateInterface.startClock();
    galaxyWidget = new GalaxyWidget(config, galaxy, gameStateInterface);
    galaxyWidget.beginGame(canvas, systemClickHandler);
}

generateGalaxy();

regenButton.onclick = function () { generateGalaxy(); }

function draw() {
    galaxyWidget.draw();
    window.requestAnimationFrame(draw);
}

draw();
