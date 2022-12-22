export class System {
    constructor(id, point, name, radius, c) {
        this.id = id;
        this.name = name;
        this.x = point.x;
        this.y = point.y;
        this.radius = radius;
        this.star = this.generateStar(c) // star(s)?
        this.planets = this.generatePlanets(c)
    }

    generateStar(c){
        const star = {
            "index": 0,
            "atmosphere": "sun",
            "size": this.getRandomFloat(c.minStarSize, c.maxStarSize),
            "distance_from_star": 0,
            "spin_speed": 1,
        };
        return star
    }

    generatePlanets(c){
        planets = []
        planetCount = this.getRandomInt(c.minPlanetCount, c.maxPlanetCount)

        for (let i = 0; i < c.systemCount; i++) {
            const planet = {
                "index": i,
                "atmosphere": "oxygen",
                "size": this.getRandomFloat(c.minPlanetSize, c.maxPlanetSize),
                "distance_from_star": i,
                "spin_speed": 1,
                "starting_position": this.getRandomFloat(0, Math.PI),
            };
            planets.push(planet);
        };
        return planets
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomFloat(min, max) {
        return Math.random() * (max - min + 1) + min;
    }

}
