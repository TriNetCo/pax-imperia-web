import * as THREE from 'three';
import { Galaxy } from "../../models/galaxy.js";

export class GalaxyDrawer {

    /**
     *
     * @param {Object} config
     * @param {Galaxy} config.galaxy
     */
    constructor(config) {
        this.cx = config.cx;
        this.galaxy = config.galaxy;
        this.mouse = config.mouse;
        this.connections = config.knownConnections;
        // this.connections = this.collectConnections(this.galaxy.systems);
        this.systemRadius = config.systemRadius;
        this.fps = config?.fps || 60;
        this.gameStateInterface = config.gameStateInterface;
        this.gameClock = this.gameStateInterface?.gameClock;

        this.setTheme();
        this.frameClock = new THREE.Clock(true);
        this.setCurrentSystem(config.currentSystemId);
        console.log("GalaxyDrawer initialized with currentSystemId: " + this.currentSystemId);
    }

    setTheme(themeName) {
        if (themeName == "navigator") {
            this.backgroundColor = "#04161c";
            this.connectionColor = "#76671D";
            this.systemColor = "#d6b248";
            this.systemShape = "circle outline";
            // css background-color rgba(120 150 160 / 40%)
        } else {
            this.backgroundColor = "#000000";
            this.connectionColor = "#76671D";
            this.systemColor = "rgb(170, 170, 255)";
            this.systemShape = "diamond";
        }
    }

    setCurrentSystem(systemId) {
        this.currentSystemId = systemId;
    }

    drawLoop() {
        // skip frames according to fps setting
        const elapsedTime = this?.frameClock?.getElapsedTime() || 1;
        const fpsInterval = 1 / this.fps;
        if (elapsedTime < fpsInterval) return;
        this.frameClock.start();

        this.drawBackground();
        this.drawConnections();
        this.drawSystems();
        this.drawCurrentSystem();
        this.drawHoveredSystem();
    }

    drawBackground() {
        let cx = this.cx;
        cx.fillStyle = this.backgroundColor;
        cx.fillRect(0, 0, cx.canvas.width, cx.canvas.height);
    }

    drawConnections() {
        const cx = this.cx;
        const connections = this.connections;
        cx.strokeStyle = this.connectionColor;
        cx.lineWidth = this.scaleRadius(2, 1);
        for (let i = 0, len = connections.length; i < len; i++) {
            const startSystem = this.galaxy.getSystem(connections[i][0]);
            const startX = this.scaleX(startSystem.position.x);
            const startY = this.scaleY(startSystem.position.y);
            const endSystem = this.galaxy.getSystem(connections[i][1]);
            const endX = this.scaleX(endSystem.position.x);
            const endY = this.scaleY(endSystem.position.y);
            cx.beginPath();
            cx.moveTo(startX, startY);
            cx.lineTo(endX, endY);
            cx.stroke();
        }
    }

    /**
     * Creates an array of connections between systems from a systems array,
     * allowing galaxyDrawer to draw lines between systems efficiently.
     * Each system contains a connections array e.g.
     * [{fromId: 0, id: "0_74", name: "Perseus", toId: 74, toPosition: {x: 217, y: 191, z: -2.67}},
     *  {fromId: 0, id: "0_39", name: "Vulpecula", toId: 39, toPosition: {x: 156, y: 172, z: -5.63}}]
     * from which we create e.g. [[0, 39], [0, 74], ...]
     * @param {*} systems
     * @returns {number[][]} connections
     */
    collectConnections(systems) {
        const connections = [];
        for (let i = 0, len = systems.length; i < len; i++) {
            const system = systems[i];
            const systemId = system.id;
            const sourceConnections = system.connections.sort();
            for (let j = 0; j < sourceConnections.length; j++) {
                const connectedSystemId = sourceConnections[j].toId;
                // We need to make sure we don't add the same connection twice
                // (i.e. 0 -> 1 and 1 -> 0)
                if (connectedSystemId > systemId) {
                    connections.push([systemId, connectedSystemId]);
                }
            }
        }
        return connections.sort();
    }

    drawSystems() {
        const color = this.systemColor;
        this.galaxy.systems.forEach(system => {
            const radius = this.getSystemRadius(system);
            const x = this.scaleX(system.position.x);
            const y = this.scaleY(system.position.y);
            this.drawPoint(x, y, radius, color);
        });
    }

    drawHoveredSystem() {
        const color = "white";
        for (let i = 0; i < this.galaxy.systems.length; i++) {
            const system = this.galaxy.systems[i];
            if (this.isMouseHovering(system)) {
                const radius = this.getSystemRadius(system, 2);
                const x = this.scaleX(system.position.x);
                const y = this.scaleY(system.position.y);
                this.drawPoint(x, y, radius, color);
                this.drawHoveredSystemName(system.name, x, y, radius);
                break;
            }
        }
    }

    drawCurrentSystem() {
        if (this.currentSystemId) {
            const system = this.galaxy.getSystem(this.currentSystemId);
            const color = "rgb(255, 255, 170)";
            const radius = this.getSystemRadius(system, 1.5);
            const x = this.scaleX(system.position.x);
            const y = this.scaleY(system.position.y);
            this.drawPoint(x, y, radius, color);
        }
    }

    drawHoveredSystemName(name, x, y) {
        const textColor = "orange";
        const defaultFontSize = 20;
        const minFontSize = 14;
        const fontSize = Math.max(this.scaleRadius(defaultFontSize), minFontSize);
        // calculate offset from system dot
        const offsetX = this.calculateXTextOffset(x, this.scaleX(5), name);
        const offsetY = this.calculateYTextOffset(y, -this.scaleY(10), name);
        this.cx.font = fontSize + "px Arial";
        // draw black outline behind
        this.cx.lineWidth = 4;
        this.cx.strokeStyle = "black";
        this.cx.strokeText(name, offsetX, offsetY);
        // draw text
        this.cx.fillStyle = textColor;
        this.cx.fillText(name, offsetX, offsetY);
    }

    calculateXTextOffset(x, defaultOffset, name) {
        const canvasPadding = this.scaleRadius(5);
        const canvasWidth = this.cx.canvas.width;
        const textWidth = this.cx.measureText(name).width;
        // attempt default offset
        let offset = x + defaultOffset;
        // if text is too close to the right edge, flip the offset
        if (offset + textWidth + canvasPadding > canvasWidth) {
            offset = x - textWidth - canvasPadding;
            // if text is too close to the left edge, add padding
        } else if (offset < canvasPadding) {
            offset = canvasPadding;
        }
        return offset;
    }

    calculateYTextOffset(y, defaultOffset, name) {
        const canvasPadding = this.scaleRadius(5);
        const mousePadding = 15;
        const canvasHeight = this.cx.canvas.height;
        const textMetrics = this.cx.measureText(name);
        const textHeight = textMetrics.actualBoundingBoxAscent +
            textMetrics.actualBoundingBoxDescent;
        // attempt default offset
        let offset = y + defaultOffset;
        // if text is too close to the top, flip to below system dot
        if (offset - textHeight - canvasPadding < 0) {
            offset = y + textHeight + mousePadding;
            // if text is too close to the bottom, add padding
        } else if (offset > canvasHeight - canvasPadding) {
            offset = canvasHeight - canvasPadding;
        }
        return offset;
    }

    isMouseHovering(system) {
        const hoverRadius = this.scaleRadius(system.radius + 3);
        const x = this.scaleX(system.position.x);
        const y = this.scaleY(system.position.y);
        const isHovering = this.mouse.x > x - hoverRadius
            && this.mouse.x < x + hoverRadius + 1
            && this.mouse.y > y - hoverRadius
            && this.mouse.y < y + hoverRadius + 2;
        return isHovering;
    }

    ////////////////////////////
    // System shape functions //
    ////////////////////////////

    drawPoint(x, y, radius, color) {
        if (this.systemShape == "circle outline") {
            this.drawCircleOutline(x, y, radius, color);
        } else if (this.systemShape == "diamond") {
            this.drawDiamond(x, y, radius, color);
        } else {
            this.drawCircle(x, y, radius, color);
        }
    }

    drawCircle(x, y, radius, color) {
        this.cx.fillStyle = color;
        this.cx.beginPath();
        this.cx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.cx.fill();
    }

    drawCircleOutline(x, y, radius, color) {
        this.cx.strokeStyle = color;
        this.cx.fillStyle = color;
        this.cx.lineWidth = this.scaleRadius(2, 1);
        this.cx.beginPath();
        this.cx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.cx.stroke();
    }

    drawDiamond(x, y, radius, color) {
        this.cx.fillStyle = color;
        this.cx.beginPath();
        this.cx.arc(x - radius, y - radius, radius, 0, Math.PI * 1 / 2, false);
        this.cx.arc(x + radius, y - radius, radius, Math.PI * 1 / 2, Math.PI, false);
        this.cx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2, false);
        this.cx.arc(x - radius, y + radius, radius, Math.PI * 3 / 2, Math.PI * 2, false);
        this.cx.closePath();
        this.cx.fill();
    }

    drawRectangle(x, y, radius, color) {
        // not used anymore
        let cx = this.cx;
        cx.fillStyle = color;
        cx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        cx.fill();
    }

    /////////////////////
    // Scale functions //
    /////////////////////

    getSystemRadius(system, multiplier = 1.0) {
        const planetCount = system.planets.length;
        const radius = multiplier * 1.5 * this.scaleRadius(planetCount + 5);
        return radius;
    }

    scaleX(x) {
        const canvasWidth = this.cx.canvas.width;
        const defaultCanvasWidth = 800;
        return x * (canvasWidth / defaultCanvasWidth);
    }

    scaleY(y) {
        const canvasHeight = this.cx.canvas.height;
        const defaultCanvasHeight = 400;
        return y * (canvasHeight / defaultCanvasHeight);
    }

    scaleRadius(radius, floor = 0) {
        const canvasWidth = this.cx.canvas.width;
        const defaultCanvasWidth = 800;
        const canvasHeight = this.cx.canvas.height;
        const defaultCanvasHeight = 400;
        const multiplier = Math.min(
            canvasWidth / defaultCanvasWidth,
            canvasHeight / defaultCanvasHeight);
        const scaledRadius = Math.max(floor, radius * multiplier)
        return scaledRadius;
    }

}
