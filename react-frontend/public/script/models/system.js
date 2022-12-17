import { SystemShape } from "./systemShape.js";

export class System {
    constructor(id, point, name) {
        this.id = id;
        this.name = name;
        this.x = point.x;
        this.y = point.y;
        this.connections = [];
        this.planets = [];
        this.stars = [];
      }

    getSystemShape() {
        return new SystemShape(this.x, this.y);
    }
}
