import { GameSettings } from "../../../gameSettings";
import { Galaxy } from "../../../models/galaxy";
import { Ship } from "./ship"

import { createMockPlanet, createMockPosition } from "../../../../test_support/Factory";

const galaxyWidgetConfig = GameSettings.galaxyWidget;
const galaxy = Galaxy.generateFromConfig(galaxyWidgetConfig);

// test('the update function returns actions when appropriate', () => {
//     const ship = new Ship();

//     const data = {};
//     const elapsedTime = 0;
//     const deltaTime = 1;
//     const system = {};
//     const galaxy = {};

//     ship.destinationEntity = {
//         type: 'wormhole',
//         id: 1,
//         name: 'wormhole',
//         object3d: {
//             position: { x: 0, y: 0, z: 0, distanceTo: () => 0 }
//         }
//     };
//     ship.object3d = {
//         position: { x: 100, y: 100, z: 0, distanceTo: () => 100 }
//     };

//     const actions = ship.update(elapsedTime, deltaTime, system, galaxy);

//     expect(actions.verb).toBe('discover');
// });

test('when a ship\'s update should have the ship jump a wormhold, it defines actions', async () => {

    // Make wormhole
    const wormhole = galaxy.systems[0].wormholes[0];
    wormhole.object3d = {
        position: createMockPosition()
    };

    // Make ship
    const ship = new Ship();
    ship.systemId = wormhole.fromId;
    ship.previousSystemId = wormhole.fromId;
    ship.destinationEntity = wormhole;
    ship.object3d = {
        position: createMockPosition({ x: 100, y: 100 })
    };
    ship.removeFromSystem = (e) => { };
    ship.removeObject3d = () => { };

    // Excercise the code
    await ship.handleWormholeJumping(1 / 60, galaxy);

    // Verify the results
    expect(ship.actions[0].verb).toBe('discover');
});


// TODO: The API for having a ship begin traveling to a planet should be presented in
// this beautiful test.  The API should be something like:
// ship.beginTravelToPlanet(planet);
test("when a ship enroute to orbit reaches/ overshoots it's destinationEntity, it should release it's destination target ending travel", async () => {
    // Set it up so it will overshoot it's destination
    const ship = new Ship();
    ship.object3d = {
        position: createMockPosition({ x: 100, y: 100 })
    };
    ship.speed = 1000000; // set speed to one million *pinkie to mouth*
    ship.destinationEntity = createMockPlanet();

    // Excercise the code
    ship.handleMovementTowardsDestination(1 / 60, galaxy);

    expect(ship.destinationEntity).toBe(null);
});

// test("when a ship enroute to colonize reaches it's destinationEntity, it should colonize the planet", async () => {
//     // Set it up so it will overshoot it's destination
//     const ship = new Ship();
//     ship.object3d = {
//         position: createMockPosition({ x: 100, y: 100 })
//     };
//     ship.speed = 1000000; // set speed to one million *pinkie to mouth*
//     ship.destinationEntity = createMockPlanet();

//     // Excercise the code
//     ship.handleColonizing(1 / 60);

//     expect(ship.destinationEntity).toBe("finish this test");
// });
