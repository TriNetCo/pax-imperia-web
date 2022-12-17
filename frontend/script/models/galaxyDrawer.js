
export class GalaxyDrawer {

    static drawBackground(cx) {
        cx.fillStyle = "Black";
        cx.fillRect(0, 0, cx.canvas.width, cx.canvas.height);
        // cx.fillRect(0, 0, canvas.width, canvas.height);
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
                cx.moveTo(ss.canvasX, ss.canvasY);
                let connectedSystem = galaxy.getSystemById(system.connections[i]);
                if (connectedSystem == undefined) // FIXME: this indicates a bug upstream from here in generating the systems correctly
                    continue;
                let connectedSystemShape = connectedSystem.getSystemShape();
                cx.lineTo(connectedSystemShape.canvasX, connectedSystemShape.canvasY);
            }

            cx.stroke();
        }
    }

    static drawSystems(cx, galaxy, systemNameLabel) {
        let nothingIsHovered = true;
        for (let i = 0; i < galaxy.systems.length; i++) {
            let system = galaxy.systems[i];
            let ss = system.getSystemShape();
            let systemDrawSize = 8;
            if (ss.isMouseHovering()) {
                systemNameLabel.innerHTML = system.name;
                nothingIsHovered = false;
                systemDrawSize = 12;
            }

        GalaxyDrawer.drawDot(cx, ss.x, ss.y, systemDrawSize);

        }
        if (nothingIsHovered) {
            systemNameLabel.innerHTML = "";
        }
    }

    static drawDot(cx, x, y, size) {
        cx.fillStyle = "rgb(200, 200, 200)";
        cx.fillRect(x, y, size, size);
        cx.fill();
    }    
}