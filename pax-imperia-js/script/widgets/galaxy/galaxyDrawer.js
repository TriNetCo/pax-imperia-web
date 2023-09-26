export class GalaxyDrawer {

    constructor(config) {
        this.cx = config.cx;
        this.galaxy = config.galaxy;
        this.systemNameLabel = config.systemNameLabel;
        this.mouse = config.mouse;
        this.connections = this.collectConnections(this.galaxy);
    }

    drawLoop() {
        // Redraw everything 60 times a second
        this.drawBackground();
        this.drawConnections()
        this.drawSystems()
        this.drawHoveredSystem()
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
        cx.lineWidth = 1;
        for (let i = 0, len = connections.length; i < len; i++) {
            const startSystem = this.galaxy.returnSystemById(connections[i][0]);
            const endSystem = this.galaxy.returnSystemById(connections[i][1]);
            if (startSystem && endSystem) {
                cx.beginPath();
                cx.moveTo(startSystem.position.x, startSystem.position.y);
                cx.lineTo(endSystem.position.x, endSystem.position.y);
                cx.stroke();
            }
        }
    }

    collectConnections(galaxy) {
        const allConnections = [];
        for (let i = 0, len = galaxy.systems.length; i < len; i++) {
            const system = galaxy.systems[i];
            for (let j = 0, len = system.connections.length; j < len; j++) {
                if (system.connections[j].id > system.id &&
                    galaxy.returnSystemById(system.connections[j].id)) {
                    allConnections.push([system.id, system.connections[j].id]);
                }
            }
        }
        return allConnections.sort();
    }

    drawSystems() {
        let systemDrawColor = "rgb(150, 150, 150)";
        for (let i = 0; i < this.galaxy.systems.length; i++) {
            const system = this.galaxy.systems[i];
            this.drawDot(system.position.x,
                system.position.y,
                system.radius,
                systemDrawColor);
        }
    }

    drawHoveredSystem() {
        let systemNameLabel = this.systemNameLabel;
        let hoverDrawColor = "rgb(255, 255, 255)";
        let nothingIsHovered = true;
        for (let i = 0; i < this.galaxy.systems.length; i++) {
            let system = this.galaxy.systems[i];
            if (this.isMouseHovering(system)) {
                systemNameLabel.innerHTML = system.name;
                let hoverDrawRadius = system.radius + 2;
                this.drawDot(system.position.x, system.position.y, hoverDrawRadius, hoverDrawColor);
                console.debug('x: ', system.position.x, 'y: ', system.position.y)
                nothingIsHovered = false;
                break;
            }
        }
        if (nothingIsHovered) {
            systemNameLabel.innerHTML = "";
        }
    }

    drawDot(x, y, radius, color) {
        let cx = this.cx;
        cx.fillStyle = color;
        cx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        cx.fill();
    }

    isMouseHovering(system) {
        let hoverRadius = system.radius + 1
        return (this.mouse.x > system.position.x - hoverRadius
            && this.mouse.x < system.position.x + hoverRadius + 1
            && this.mouse.y > system.position.y - hoverRadius
            && this.mouse.y < system.position.y + hoverRadius + 2);
    }

}
