import { GalaxyWidget } from './models/galaxyWidget.js';

window.mouse = { x: 0, y: 0 };
const galaxyWidget = new GalaxyWidget("galaxy-container");
galaxyWidget.beginGame();
