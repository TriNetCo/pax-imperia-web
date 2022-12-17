export class GalaxyDrawer {
    static systemRadius = 5;

    static drawLoop(cx, galaxy, systemNameLabel) {
        // Redraw everything 60 times a second
    
        this.drawBackground(cx);
    
        this.drawConnections(cx, galaxy)
    
        this.drawSystems(cx, galaxy)

        this.drawHoveredSystem(cx, galaxy, systemNameLabel)

        // bind args to drawLoop so that it can be passed to requestAnimationFrame
        function boundDrawLoop () {
            GalaxyDrawer.drawLoop(cx, galaxy, systemNameLabel);
        }
        window.requestAnimationFrame(boundDrawLoop)
    }
    
    static drawBackground(cx) {
        cx.fillStyle = "Black";
        cx.fillRect(0, 0, cx.canvas.width, cx.canvas.height);
    }

    static drawConnections(cx, galaxy) {
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];

            // Draw lines
            cx.beginPath();
            cx.strokeStyle = "orange";
            cx.lineWidth = 0.;            
            
            for (let i = 0; i < system.connections.length; i++) {
                cx.moveTo(system.x, system.y);
                let connectedSystem = galaxy.getSystemById(system.connections[i]);
                if (connectedSystem == undefined) // FIXME: this indicates a bug upstream from here in generating the systems correctly
                    continue;
                cx.lineTo(connectedSystem.x, connectedSystem.y);
            }

            cx.stroke();
        }
    }

    static drawSystems(cx, galaxy) {
        let systemDrawRadius = this.systemRadius
        let systemDrawColor = "rgb(150, 150, 150)";
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];
            this.drawDot(cx, system.x, system.y, systemDrawRadius, systemDrawColor);
        }
    }

    static drawHoveredSystem(cx, galaxy, systemNameLabel) {
        let hoverDrawRadius = this.systemRadius + 2;
        let hoverDrawColor = "rgb(255, 255, 255)";
        let nothingIsHovered = true;
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];
            if (this.isMouseHovering(system)) {
                systemNameLabel.innerHTML = system.name;
                nothingIsHovered = false;
                this.drawDot(cx, system.x, system.y, hoverDrawRadius, hoverDrawColor);
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
        let hoverRadius = this.systemRadius + 1
        return (window.mouse.x > system.x - hoverRadius
             && window.mouse.x < system.x + hoverRadius + 1
             && window.mouse.y > system.y - hoverRadius
             && window.mouse.y < system.y + hoverRadius + 2);
    }
}