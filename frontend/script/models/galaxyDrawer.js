export class GalaxyDrawer {

    static drawLoop(cx, galaxy, systemNameLabel) {
        // Redraw everything 60 times a second
        this.drawBackground(cx);
        this.drawConnections(cx, galaxy)
        this.drawSystems(cx, galaxy)
        this.drawHoveredSystem(cx, galaxy, systemNameLabel)
    }

    static drawBackground(cx) {
        cx.fillStyle = "Black";
        cx.fillRect(0, 0, cx.canvas.width, cx.canvas.height);
    }

    static drawConnections(cx, galaxy) {
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

    static drawSystems(cx, galaxy) {
        let systemDrawColor = "rgb(150, 150, 150)";
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];
            this.drawDot(cx, system.x, system.y, system.radius, systemDrawColor);
        }
    }

    static drawHoveredSystem(cx, galaxy, systemNameLabel) {
        let hoverDrawColor = "rgb(255, 255, 255)";
        let nothingIsHovered = true;
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];
            if (this.isMouseHovering(system)) {
                systemNameLabel.innerHTML = system.name;
                let hoverDrawRadius = system.radius + 2;
                this.drawDot(cx, system.x, system.y, hoverDrawRadius, hoverDrawColor);
                nothingIsHovered = false;
                break;
            }
        }
        if (nothingIsHovered) {
            systemNameLabel.innerHTML = "";
        }
    }

    static drawDot(cx, x, y, radius, color) {
        cx.fillStyle = color;
        cx.fillRect(x-radius, y-radius, radius*2, radius*2);
        cx.fill();
    }

    static isMouseHovering(system) {
        let hoverRadius = system.radius + 1
        return (window.mouse.x > system.x - hoverRadius
             && window.mouse.x < system.x + hoverRadius + 1
             && window.mouse.y > system.y - hoverRadius
             && window.mouse.y < system.y + hoverRadius + 2);
    }

}
