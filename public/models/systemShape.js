export class SystemShape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lengthOfRect = 20;
        this.scale = 22;
        this.radius = 10;
        this.offsetX = this.x * (this.scale-1) - this.radius;
        this.offsetY = this.y * (this.scale-1) - this.radius;
    }

    isMouseHovering() {
        return (window.mouse.x > this.x + this.offsetX
             && window.mouse.x < this.x + this.offsetX + this.lengthOfRect
             && window.mouse.y > this.y + this.offsetY
             && window.mouse.y < this.y + this.offsetY + this.lengthOfRect);
    }
}