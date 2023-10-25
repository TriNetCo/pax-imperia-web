import { GameSettings } from "../../../gameSettings";
import { Galaxy } from "../../../models/galaxy";
import { Ship } from "./ship"

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

test('when a ship\'s update should have the ship jump a wormhold, it returns actions', async () => {

    // Make wormhole
    const wormhole = galaxy.systems[0].wormholes[0];
    wormhole.object3d = {
        position: { x: 0, y: 0, z: 0, distanceTo: () => 0 }
    };

    // Make ship
    const ship = new Ship();
    ship.systemId = wormhole.fromId;
    ship.previousSystemId = wormhole.fromId;
    ship.destinationEntity = wormhole;
    ship.object3d = {
        position: { x: 100, y: 100, z: 0, distanceTo: () => 0 }
    };
    ship.removeFromSystem = (e) => { };
    ship.removeObject3d = () => { };

    // Excercise the code
    const actions = await ship.handleWormholeJumping(1 / 60, galaxy);

    // Verify the results
    expect(ship.actions[0].verb).toBe('discover');
});
