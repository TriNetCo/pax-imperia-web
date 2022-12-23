export class SpaceViewDrawer {

    constructor(config) {
        this.cx = config.cx;
        this.galaxy = config.galaxy;
        this.systemNameLabel = config.systemNameLabel;
        this.mouse = config.mouse;
    }

    drawLoop() {
        // Redraw everything 60 times a second
        this.drawBackground();
    }

    drawBackground() {
        let cx = this.cx;
        cx.fillStyle = "Black";
        cx.fillRect(0, 0, cx.canvas.width, cx.canvas.height);
    }

}
