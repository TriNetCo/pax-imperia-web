export class SystemShape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.margin = 1;
    }

    isMouseHovering() {
        let hoverRadius = this.radius + this.margin
        return (window.mouse.x > this.x - hoverRadius
             && window.mouse.x < this.x + hoverRadius + 1
             && window.mouse.y > this.y - hoverRadius
             && window.mouse.y < this.y + hoverRadius + 2);
    }
}