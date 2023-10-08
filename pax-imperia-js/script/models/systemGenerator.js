import { getRandomNum, roundToDecimal } from './helpers.js'
import { shipConfigs } from '../widgets/space_view/entities/shipConfigs.js';

export class SystemGenerator {
    constructor(id, position, name, radius, c) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.radius = radius;
        this.connections = [];
        this.stars = [this.generateStar(c)];
        this.planets = this.generatePlanets(c);
        // Place a ship in every system
        this.ships = this.generateShips(c);
        // Use manual system for debugging
        if (false) {
            this.stars = this.manualStars
            this.planets = this.manualPlanets
        }
    }

    // this function serializes the data to an object without actually
    // serializing it to a string which a database and network connection would want
    generateData() {
        let data = {};
        for (var key in this) {
            data[key] = this[key];
        };
        return (data);
    }

    generateStar(c) {
        // Currently generates a single star
        let star = {
            "index": 0,
            "atmosphere": "sun",
            "size": getRandomNum(c.minStarSize, c.maxStarSize, 2),
            "distance_from_star": 0,
            "spin_speed": getRandomNum(0.5, 1.5, 1),
            "starting_angle": 0,
        };
        return star;
    }

    generatePlanets(c) {
        let planets = [];
        let planetCount = getRandomNum(c.minPlanetCount, c.maxPlanetCount, 0);
        let minDistance = this.stars[0].size;

        for (let i = 0; i < planetCount; i++) {
            let planetSize = getRandomNum(c.minPlanetSize, c.maxPlanetSize, 2);
            let additionalDistance = getRandomNum(0.6, 1.5, 2);
            let planetDistance = roundToDecimal(minDistance + planetSize + additionalDistance, 2);
            let startingAngle = getRandomNum(0, Math.PI, 2);
            // Start all planets in the same spot to debug random settings
            // startingAngle = 0;

            let planet = {
                "index": i,
                "atmosphere": "earthlike000" + getRandomNum(1, 9, 0),
                "cloud_type": "clouds000" + getRandomNum(1, 9, 0),
                "size": planetSize,
                "distance_from_star": planetDistance,
                "spin_speed": getRandomNum(0.5, 1.5, 1),
                "starting_angle": startingAngle,
            };
            minDistance = planetDistance + planetSize;
            planets.push(planet);
        };
        return planets;
    }

    generateShips(c) {
        let ships = [];
        let shipCount = getRandomNum(1, 3, 0);
        const shipOptions = [
            'CraizanStar',
            'ForceBadger',
            'LightFox',
            'SpaceExcalibur',
            'StarForce',
            'StriderOx',
            'CosmicShark',
            'GalacticLeopard',
            'HyperFalcon',
            'MeteorMantis',
            'ProtonLegacy',
            'SpaceSphinx',
            'StarSparrow',
            'VoidWhale',
            'GalacticOkamoto'
        ]

        const badListForMeshes = [
            'FlyingInsects', 'GenericSpaceships', 'GalaxyRaptor'
        ]

        const badListForTextures = [
            'AstroEagle', 'NightAye',
        ]

        for (let i = 0; i < shipCount; i++) {
            let shipX = getRandomNum(-10, 10, 2);
            let shipY = getRandomNum(-10, 10, 2);
            let shipZ = getRandomNum(this.stars[0].size, 12, 2);
            // let shipMake = shipOptions[i]; // one of each make
            // let shipMake = shipOptions[Math.floor(Math.random() * shipOptions.length)]; // random make
            // let shipMake = 'StarSparrow';
            // let shipModel = i + 1; // getRandomNum(1, 20, 0); // "1"
            // const maxModel = shipConfigs.hasOwnProperty(shipMake) ? shipConfigs[shipMake]['maxModel'] : 20;
            // if (shipModel > maxModel) {
            //     shipModel = getRandomNum(1, maxModel, 0);
            // }
            let shipMake = shipOptions[Math.floor(Math.random() * shipOptions.length)]; // random make
            const maxModel = shipConfigs.hasOwnProperty(shipMake) ? shipConfigs[shipMake]['maxModel'] : 20;
            const shipModel = getRandomNum(1, maxModel, 0);
            let ship = {
                // give ships unique names
                "name": "ship_" + shipMake + shipModel + "_" + this.id + "_" + i,
                "index": i,
                "position": { x: shipX, y: shipY, z: shipZ },
                "shipMake": shipMake,
                "shipModel": shipModel,
            }
            ships.push(ship);


        }
        return ships;
    }

    toJson() {
        return JSON.stringify(this)
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
            "starting_angle": 5,
        }
    ]

    manualPlanets = [
        {
            "index": 1,
            "atmosphere": "oxygen",
            "size": 0.4,
            "distance_from_star": 2,
            "spin_speed": 2,
            "starting_angle": 10,
        },
        {
            "index": 2,
            "atmosphere": "oxygen",
            "size": 0.8,
            "distance_from_star": 3,
            "spin_speed": 3,
            "starting_angle": 40,
        },
        {
            "index": 3,
            "atmosphere": "oxygen",
            "size": 1.25,
            "distance_from_star": 4,
            "spin_speed": 4,
            "starting_angle": 180,
        }
    ]

}
