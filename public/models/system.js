export class System {
    constructor(id, point, connections) {
        this.id = id;
        this.x = point.x;
        this.y = point.y;
        this.connections = connections;
      }
}