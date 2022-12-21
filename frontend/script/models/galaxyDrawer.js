export class GalaxyDrawer {

    constructor(config) {
        this.cx = config.cx;
        this.galaxy = config.galaxy;
        this.systemNameLabel = config.systemNameLabel;
        this.mouse = config.mouse;
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
        let cx = this.cx;
        let galaxy = this.galaxy;
        cx.strokeStyle = "orange";
        cx.lineWidth = 1;
        for (let i = 0, len = galaxy.connections.length; i < len; i++) {
            let startSystem = galaxy.systems[galaxy.connections[i][0]];
            let endSystem = galaxy.systems[galaxy.connections[i][1]];
            cx.beginPath();
            cx.moveTo(startSystem.x, startSystem.y);
            cx.lineTo(endSystem.x, endSystem.y);
            cx.stroke();
        }
    }

    drawSystems() {
        let cx = this.cx;
        let galaxy = this.galaxy;
        let systemDrawColor = "rgb(150, 150, 150)";
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];
            this.drawDot(system.x, system.y, system.radius, systemDrawColor);
        }
    }

    drawHoveredSystem() {
        let cx = this.cx;
        let galaxy = this.galaxy;
        let systemNameLabel = this.systemNameLabel;
        let hoverDrawColor = "rgb(255, 255, 255)";
        let nothingIsHovered = true;
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];
            if (this.isMouseHovering(system)) {
                systemNameLabel.innerHTML = system.name;
                let hoverDrawRadius = system.radius + 2;
                this.drawDot(system.x, system.y, hoverDrawRadius, hoverDrawColor);
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
        return (this.mouse.x > system.x - hoverRadius
             && this.mouse.x < system.x + hoverRadius + 1
             && this.mouse.y > system.y - hoverRadius
             && this.mouse.y < system.y + hoverRadius + 2);
    }

}
