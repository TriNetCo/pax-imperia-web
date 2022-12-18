export class System {
    constructor(id, point, name) {
        this.id = id;
        this.name = name;
        this.x = point.x;
        this.y = point.y;
        this.radius = 5;
        this.planets = [];
        this.stars = [];
      }
}
