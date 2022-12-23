import { getRandomNum, roundToDecimal } from '/script/models/helpers.js'

export class System {
    constructor(id, point, name, radius, c) {
        this.id = id;
        this.name = name;
        this.x = point.x;
        this.y = point.y;
        this.radius = radius;
        this.stars = [this.generateStar(c)]
        this.planets = this.generatePlanets(c)
        this.ships = []
        this.entities = this.stars.concat(this.planets).concat(this.ships)
    }

    generateStar(c){
        let star = {
            "index": 0,
            "atmosphere": "sun",
            "size": getRandomNum(c.minStarSize, c.maxStarSize, 2),
            "distance_from_star": 0,
            "spin_speed": 1,
            "starting_position": 0,
        };
        return star
    }

    generatePlanets(c){
        let sizeToDistanceMultipler = 1/3
        let planets = [];
        let planetCount = getRandomNum(c.minPlanetCount, c.maxPlanetCount, 0);
        let minDistance = this.stars[0].size * sizeToDistanceMultipler;

        for (let i = 0; i < planetCount; i++) {
            let planetSize = getRandomNum(c.minPlanetSize, c.maxPlanetSize, 2);
            let additionalDistance = getRandomNum(0.2, 0.5, 2)
            let planetDistance = roundToDecimal(minDistance + planetSize * sizeToDistanceMultipler + additionalDistance, 2);
            let startingPosition = getRandomNum(0, Math.PI, 2);
            startingPosition = 0;

            let planet = {
                "index": i,
                "atmosphere": "oxygen",
                "size": planetSize,
                "distance_from_star": planetDistance,
                "spin_speed": 1,
                "starting_position": startingPosition,
            };
            minDistance = planetDistance + planetSize * sizeToDistanceMultipler
            planets.push(planet);
        };
        return planets
    }

}
