import {getRandomInt, getRandomFloat} from '/script/models/helpers.js'

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
        let star = {
            "index": 0,
            "atmosphere": "sun",
            "size": getRandomFloat(c.minStarSize, c.maxStarSize),
            "distance_from_star": 0,
            "spin_speed": 1,
        };
        return star
    }

    generatePlanets(c){
        let planets = []
        let planetCount = getRandomInt(c.minPlanetCount, c.maxPlanetCount)

        for (let i = 0; i < planetCount; i++) {
            let planet = {
                "index": i,
                "atmosphere": "oxygen",
                "size": getRandomFloat(c.minPlanetSize, c.maxPlanetSize),
                "distance_from_star": i,
                "spin_speed": 1,
                "starting_position": getRandomFloat(0, Math.PI),
            };
            planets.push(planet);
        };
        return planets
    }

}
