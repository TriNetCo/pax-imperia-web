export class GalaxyDrawer {

    constructor(config) {
        this.cx = config.cx;
        this.galaxy = config.galaxy;
        this.systemsData = config.galaxy.systems;
        this.systemNameLabel = config.systemNameLabel;
        this.mouse = config.mouse;
        this.connections = this.collectConnections(this.systemsData);
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
            let startSystem = this.systemsData[connections[i][0]];
            let endSystem = this.systemsData[connections[i][1]];
            cx.beginPath();
            cx.moveTo(startSystem.position.x, startSystem.position.y);
            cx.lineTo(endSystem.position.x, endSystem.position.y);
            cx.stroke();
        }
    }

    collectConnections(systemsData) {
        const connections = [];
        for (let i = 0, len = systemsData.length; i < len; i++) {
            let system = systemsData[i];
            let sourceConnections = system.connections.sort();
            for (let j = 0; j < sourceConnections.length; j++) {
                // connection = {id: 1, name: 'Reticulum', position: {x,y,z}}
                let connection = sourceConnections[j];
                // We need to make sure we don't add the same connection twice
                // (i.e. 0 -> 1 and 1 -> 0)
                if (connection.id > i) {
                    connections.push([i, connection.id]);
                }
            }
        }
        return connections.sort();
    }

    drawSystems() {
        let galaxy = this.galaxy;
        let systemDrawColor = "rgb(150, 150, 150)";
        for (let i = 0; i < this.systemsData.length; i++) {
            let system = this.systemsData[i];
            this.drawDot(system.position.x, system.position.y, system.radius, systemDrawColor);
        }
    }

    drawHoveredSystem() {
        let galaxy = this.galaxy;
        let systemNameLabel = this.systemNameLabel;
        let hoverDrawColor = "rgb(255, 255, 255)";
        let nothingIsHovered = true;
        for (let i = 0; i < this.systemsData.length; i++) {
            let system = this.systemsData[i];
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
        cx.fillRect(x-radius, y-radius, radius*2, radius*2);
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
