import { getRandomNum, roundToDecimal } from './helpers.js'
import { shipConfigs, shipOptions } from '../widgets/space_view/entities/shipConfigs.js';
import {Colony} from '../widgets/space_view/entities/colony.js';
import { Ship } from '../widgets/space_view/entities/ship.js';

export class SystemGenerator {
    constructor(c) {
        this.nextShipId = 0;
        this.nextPlanetId = 0;
        this.nextColonyId = 0;
        this.c = c;

        // Use manual system for debugging
        if (false) {
            this.stars = this.manualStars
            this.planets = this.manualPlanets
        }
    }

    // this function serializes the data to an object without actually
    // serializing it to a string which a database and network connection would want
    generateSystem(id, position, name) {
        this.id = id;
        this.position = position;
        this.name = name;
        this.radius = this.c.systemRadius;

        this.connections = [];
        this.stars = [this.generateStar(id)];
        this.planets = this.generatePlanets(id);

        this.colonies = this.generateDebugColonies(this.planets);
        this.ships = this.generateDebugShips();

        // This is creating a new object, and loading it with all the
        // data from this object, but not the functions?
        let data = {};
        for (var key in this) {
            data[key] = this[key];
        };
        return (data);
    }

    generateStar(id) {
        // Currently generates a single star
        let star = {
            "id": id,
            "index": 0,
            "atmosphere": "sun",
            "size": getRandomNum(this.c.minStarSize, this.c.maxStarSize, 2),
            "distance_from_star": 0,
            "spin_speed": getRandomNum(0.5, 1.5, 1),
            "starting_angle": 0,
        };
        return star;
    }

    generatePlanets(systemId) {
        const c = this.c;
        let planets = [];
        let planetCount = getRandomNum(c.minPlanetCount, c.maxPlanetCount, 0);
        let minDistance = this.stars[0].size;

        for (let i = 0; i < planetCount; i++) {
            let planetSize = getRandomNum(c.minPlanetSize, c.maxPlanetSize, 2);
            let additionalDistance = getRandomNum(0.6, 1.5, 2);
            let planetDistance = roundToDecimal(minDistance + planetSize + additionalDistance, 2);
            let startingAngle = getRandomNum(0, Math.PI, 2);

            let planet = {
                "id": this.getNextPlanetId(),
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

    // For debugging, we'll put a colony for player 1 on the first planet
    // and a colony for player 2 on the second planet if it exists
    generateDebugColonies() {
        let colonies = [];

        colonies.push(new Colony(this.getNextColonyId(), 1, this.planets[0]["id"], 0))
        this.planets[0].colony = colonies[0];

        if (this.planets[1]) {
            colonies.push(new Colony(this.getNextColonyId(), 2, this.planets[1]["id"], 0))
            this.planets[1].colony = colonies[1];
        }

        return colonies;
    }

    generateDebugShips() {
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
            let shipConfig = {
                id: this.getNextShipId(),
                playerId: 1,
                systemId: this.id,
                position: { x: shipX, y: shipY, z: shipZ },
                shipSpec: {
                    make: shipMake,
                    model: shipModel,
                    size: this.getShipSize(shipMake, shipModel),
                },
            }

            ships.push( new Ship(shipConfig) );

        }
        return ships;
    }

    getNextShipId() {
        const shipId = this.nextShipId;
        this.nextShipId += 1;
        return shipId;
    }

    getNextPlanetId() {
        const planetId = this.nextPlanetId;
        this.nextPlanetId += 1;
        return planetId;
    }

    getNextColonyId() {
        const colonyId = this.nextColonyId;
        this.nextColonyId += 1;
        return colonyId;
    }

    getShipMake(strategy, override = null) {
        const defaultMake = 'GalacticLeopard';
        if (override) {
            return override;
        }
        if (strategy === 'random') {  // Choose a random ship make from the list
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
