import { GalaxyDrawer } from './galaxyDrawer.js';
import { GalaxyDomManager } from './galaxyDomManager.js';
// import * as THREE from 'three';
import * as THREE from '/node_modules/three/build/three.module.js';

export class GalaxyWidget {

    galaxyDrawer;
    galaxyDomManager;
    canvas;
    systemClickHandler;

    constructor(config, gameData) {
        this.c = config;
        this.mouse = { x: 0, y: 0 };
        this.galaxy = gameData.galaxy;
        window.gameClock = window.gameClock ? window.gameClock : new THREE.Clock();
        if (!window.gameClock.running) {
            window.gameClock.start();
        }
    }

    beginGame(canvas, systemClickHandler) {
        this.canvas = canvas;
        this.systemClickHandler = systemClickHandler;
        let c = this.c;

        canvas.width = c.canvasWidth;
        canvas.height = c.canvasHeight;
        let cx = canvas.getContext("2d");

        let systemNameLabel = document.getElementById("system-name");
        this.galaxyDrawer = new GalaxyDrawer({cx: cx, galaxy: this.galaxy, systemNameLabel: systemNameLabel, mouse: this.mouse});
        this.galaxyDomManager = new GalaxyDomManager(cx, this.galaxy.systems, this.galaxyDrawer, systemClickHandler, this.mouse)
        this.galaxyDomManager.attachDomEventsToCode();
    }

    updateGalaxyData(systemsData, galaxy) {
        let canvas = this.canvas;
        let systemClickHandler = this.systemClickHandler;
        this.galaxy = galaxy;

        let cx = canvas.getContext("2d");
        this.detachFromDom();

        this.galaxy.systems = systemsData;

        let systemNameLabel = document.getElementById("system-name");
        this.galaxyDrawer = new GalaxyDrawer({cx: cx, galaxy: this.galaxy, systemNameLabel: systemNameLabel, mouse: this.mouse});
        this.galaxyDomManager = new GalaxyDomManager(cx, this.galaxy.systems, this.galaxyDrawer, systemClickHandler, this.mouse)
        this.galaxyDomManager.attachDomEventsToCode();
    }

    draw() {
        this.galaxyDrawer.drawLoop();
    }

    detachFromDom() {
        this.galaxyDomManager.detachFromDom();
    }

}
