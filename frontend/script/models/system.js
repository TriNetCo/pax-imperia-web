export class System {
    constructor(id, point, name, radius = 5) {
        this.id = id;
        this.name = name;
        this.x = point.x;
        this.y = point.y;
        this.radius = radius;
        this.planets = [];
        this.stars = [];
      }
}
