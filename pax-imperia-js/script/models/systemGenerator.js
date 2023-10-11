import { getRandomNum, roundToDecimal } from './helpers.js'
import { shipConfigs, shipOptions } from '../widgets/space_view/entities/shipConfigs.js';

export class SystemGenerator {
    constructor(id, position, name, radius, c) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.radius = radius;
        this.connections = [];
        this.stars = [this.generateStar(c)];
        this.planets = this.generatePlanets(c, id);
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

    generatePlanets(c, systemId) {
        let planets = [];
        let planetCount = getRandomNum(c.minPlanetCount, c.maxPlanetCount, 0);
        let minDistance = this.stars[0].size;

        for (let i = 0; i < planetCount; i++) {
            let planetSize = getRandomNum(c.minPlanetSize, c.maxPlanetSize, 2);
            let additionalDistance = getRandomNum(0.6, 1.5, 2);
            let planetDistance = roundToDecimal(minDistance + planetSize + additionalDistance, 2);
            let startingAngle = getRandomNum(0, Math.PI, 2);

            let planet = {
                "id": systemId + "_" + i,
                "number": i,
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
        let systemShipMake = null; //this.getShipMake(null, null);

        for (let i = 0; i < shipCount; i++) {
            let shipX = getRandomNum(-16, 16, 2);
            let shipY = getRandomNum(-8, 12, 2);
            let shipZ = getRandomNum(this.stars[0].size, 12, 2);
            // let shipMake = systemShipMake || this.getShipMake('override');
            let shipMake = 'GalacticLeopard'
            // let shipModel = this.getShipModel('random', shipMake, i);
            let shipModel = 6;
            let ship = {
                // give ships unique names
                "name": "ship_" + shipMake + shipModel + "_" + this.id + "_" + i,
                "id": this.id + "_" + i,
                "position": { x: shipX, y: shipY, z: shipZ },
                "shipMake": shipMake,
                "shipModel": shipModel,
                "size": this.getShipSize(shipMake, shipModel),
            }
            ships.push(ship);


        }
        return ships;
    }

    getShipMake(strategy, override = null) {
        const defaultMake = 'GalacticLeopard';
        if (override) {
            return override;
        }
        if (strategy === 'random') {
            return shipOptions[Math.floor(Math.random() * shipOptions.length)];
        }
        if (strategy === 'sequential') {
            if (i <= shipOptions.length) {
                return shipOptions[i];
            }
            return shipOptions[Math.floor(Math.random() * shipOptions.length)];
        }
        return defaultMake;
    }

    getShipModel(strategy, make, i, override = null) {
        const defaultModel = '6';
        // get max model # for ship make
        const maxModel = shipConfigs.hasOwnProperty(make) ? shipConfigs[make]['maxModel'] : 20;
        if (override) {
            return override;
        }
        if (strategy === 'random') {
            return getRandomNum(1, maxModel, 0);
        }
        if (strategy === 'sequential') {
            if (i <= maxModel) {
                return i;
            } else {
                return getRandomNum(1, maxModel, 0);
            }
        }
        return defaultModel;
    }

    getShipSize(make, model) {
        let size = 0.002;
        if (['GalacticLeopard', 'VoidWhale'].includes(make)) {
            size = 0.00015;
        } else if (['CraizanStar', 'GalacticOkamoto'].includes(make)) {
            size = 0.0003;
        } else if (['SpaceSphinx'].includes(make)) {
            size = 0.0005;
        } else if (['StriderOx', 'SpaceExcalibur'].includes(make)) {
            size = 0.0015;
        }
        // size = size * 1.5;
        return size;
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
