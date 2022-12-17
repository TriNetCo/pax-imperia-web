
export class GalaxyDrawer {

    static drawLoop(cx, galaxy, systemNameLabel) {
        // Redraw everything 60 times a second
    
        GalaxyDrawer.drawBackground(cx);
    
        GalaxyDrawer.drawConnections(cx, galaxy)
    
        GalaxyDrawer.drawSystems(cx, galaxy, systemNameLabel)
    
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
            let ss = system.getSystemShape();

            // Draw lines
            cx.beginPath();
            cx.strokeStyle = "orange";
            cx.lineWidth = 0.;            
            
            for (let i = 0; i < system.connections.length; i++) {
                cx.moveTo(ss.x, ss.y);
                let connectedSystem = galaxy.getSystemById(system.connections[i]);
                if (connectedSystem == undefined) // FIXME: this indicates a bug upstream from here in generating the systems correctly
                    continue;
                let connectedSystemShape = connectedSystem.getSystemShape();
                cx.lineTo(connectedSystemShape.x, connectedSystemShape.y);
            }

            cx.stroke();
        }
    }

    static drawSystems(cx, galaxy, systemNameLabel) {
        let nothingIsHovered = true;
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];
            let ss = system.getSystemShape();
            let systemRadius = ss.radius;
            let systemDrawColor = "rgb(150, 150, 150)";
            if (ss.isMouseHovering()) {
                systemNameLabel.innerHTML = system.name;
                nothingIsHovered = false;
                systemRadius = systemRadius + 2;
                systemDrawColor = "rgb(255, 255, 255)";
            }

        GalaxyDrawer.drawDot(cx, ss.x, ss.y, systemRadius, systemDrawColor);

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
}