import { SystemShape } from "./systemShape.js";

export class System {
    constructor(id, point, connections) {
        this.id = id;
        this.x = point.x;
        this.y = point.y;
        this.connections = connections;
        this.planets = [];
        this.stars = [];
      }

    getSystemShape() {
        return new SystemShape(this.x, this.y);
    }
}
