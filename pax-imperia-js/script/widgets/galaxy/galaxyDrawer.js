export class GalaxyDrawer {

    constructor(config) {
        this.cx = config.cx;
        this.galaxy = config.galaxy;
        this.mouse = config.mouse;
        this.connections = this.collectConnections(this.galaxy.systems);
        this.currentSystemId = config.currentSystemId;
    }

    drawLoop() {
        // Redraw everything 60 times a second
        this.drawBackground();
        this.drawConnections();
        this.drawSystems();
        this.drawHoveredSystem();
        this.drawCurrentSystem();
    }

    drawBackground() {
        let cx = this.cx;
        cx.fillStyle = "Black";
        cx.fillRect(0, 0, cx.canvas.width, cx.canvas.height);
    }

    drawConnections() {
        const cx = this.cx;
        const connections = this.connections;
        cx.strokeStyle = "orange";
        cx.lineWidth = this.scaleRadius(1, 0);
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
        let color = "rgb(150, 150, 150)";
        this.galaxy.systems.forEach(system => {
            const x = this.scaleX(system.position.x);
            const y = this.scaleY(system.position.y);
            const radius = this.scaleRadius(system.radius);
            this.drawDot(x, y, radius, color);
        });
    }

    drawHoveredSystem() {
        let hoverColor = "rgb(255, 255, 255)";
        for (let i = 0; i < this.galaxy.systems.length; i++) {
            let system = this.galaxy.systems[i];
            if (this.isMouseHovering(system)) {
                const hoverRadius = this.scaleRadius(system.radius) + 2;
                const x = this.scaleX(system.position.x);
                const y = this.scaleY(system.position.y);
                this.drawDot(x, y, hoverRadius, hoverColor);
                this.drawHoveredSystemName(system.name, x, y, hoverRadius);
                break;
            }
        }
    }

    drawCurrentSystem() {
        if (this.currentSystemId) {
            const system = this.galaxy.getSystem(this.currentSystemId);
            const color = "yellow";
            const radius = this.scaleRadius(system.radius) + 2;
            const x = this.scaleX(system.position.x);
            const y = this.scaleY(system.position.y);
            this.drawDot(x, y, radius, color);
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

    drawDot(x, y, radius, color) {
        let cx = this.cx;
        cx.fillStyle = color;
        cx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        cx.fill();
    }

    isMouseHovering(system) {
        const hoverRadius = this.scaleRadius(system.radius) + 1;
        const x = this.scaleX(system.position.x);
        const y = this.scaleY(system.position.y);
        const isHovering = this.mouse.x > x - hoverRadius
            && this.mouse.x < x + hoverRadius + 1
            && this.mouse.y > y - hoverRadius
            && this.mouse.y < y + hoverRadius + 2;
        return isHovering;
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
