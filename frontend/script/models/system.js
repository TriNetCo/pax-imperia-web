import { getRandomNum, roundToDecimal } from './helpers.js'

export class System {
    constructor(id, point, name, radius, c) {
        this.id = id;
        this.name = name;
        this.x = point.x;
        this.y = point.y;
        this.radius = radius;
        this.stars = [this.generateStar(c)];
        this.planets = this.generatePlanets(c);
        // Use manual system for debugging
        if (false) {
            this.stars = this.manualStars
            this.planets = this.manualPlanets
        }
        this.ships = [];
        //this.entities = this.stars.concat(this.planets).concat(this.ships);
    }

    toJson() {
        return JSON.stringify(this)
    }

    generateStar(c) {
        // Currently generates a single star
        let star = {
            "index": 0,
            "atmosphere": "sun",
            "size": getRandomNum(c.minStarSize, c.maxStarSize, 2),
            "distance_from_star": 0,
            "spin_speed": 1,
            "starting_position": 0,
        };
        return star;
    }

    generatePlanets(c) {
        let sizeToDistanceMultipler = 1/3;
        let planets = [];
        let planetCount = getRandomNum(c.minPlanetCount, c.maxPlanetCount, 0);
        let minDistance = this.stars[0].size * sizeToDistanceMultipler;

        for (let i = 0; i < planetCount; i++) {
            let planetSize = getRandomNum(c.minPlanetSize, c.maxPlanetSize, 2);
            let additionalDistance = getRandomNum(0.2, 0.5, 2);
            let planetDistance = roundToDecimal(minDistance + planetSize * sizeToDistanceMultipler + additionalDistance, 2);
            let startingPosition = getRandomNum(0, Math.PI, 2);
            // Start all planets in the same spot to debug random settings
            // startingPosition = 0;

            let planet = {
                "index": i,
                "atmosphere": "oxygen",
                "size": planetSize,
                "distance_from_star": planetDistance,
                "spin_speed": 1,
                "starting_position": startingPosition,
            };
            minDistance = planetDistance + planetSize * sizeToDistanceMultipler;
            planets.push(planet);
        };
        return planets;
    }
}

export class manualSystem {

    manualStars = [
        {
            "index": 0,
            "atmosphere": "sun",
            "size": 2,
            "distance_from_star": 0,
            "spin_speed": 1,
            "starting_position": 5,
        }
    ]

    manualPlanets = [
        {
            "index": 1,
            "atmosphere": "oxygen",
            "size": 0.4,
            "distance_from_star": 2,
            "spin_speed": 2,
            "starting_position": 10,
        },
        {
            "index": 2,
            "atmosphere": "oxygen",
            "size": 0.8,
            "distance_from_star": 3,
            "spin_speed": 3,
            "starting_position": 40,
        },
        {
            "index": 3,
            "atmosphere": "oxygen",
            "size": 1.25,
            "distance_from_star": 4,
            "spin_speed": 4,
            "starting_position": 180,
        }
    ]

}
