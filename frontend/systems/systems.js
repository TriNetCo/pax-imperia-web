import { SpaceViewWidget } from '/script/widgets/space_view/spaceViewWidget.js'
import { GameSettings } from '/script/gameSettings.js';
import { Galaxy } from '/script/models/galaxy.js';
// import { SystemRepresentation } from '/script/widgets/space_view/systemRepresentation.js'

///////////////////////
// Input System Data //
///////////////////////

let systemDataOld = {
    "id": "1",
    "name": "Rigel",
    "g_position": { "x": 1, "y": 1 },
    "stars": [
        {
            "index": 0,
            "atmosphere": "sun",
            "size": 2,
            "distance_from_star": 0,
            "spin_speed": 1,
            "starting_position": 5,  /* This is a random number where the planet's orbit begins so they aren't all rotating in sync with each other. */
        }
    ],
    "planets": [
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
    ],
    "connected_systems": [
        {
            "id": 2,
            "name": "berry",
            "position": { "x": 2, "y": 3 }
        }
    ],
    "squadrons": [
        {
            "owner": 1,
            "system": 1,
            "image": "meh",
            "orbit_target": "none",
            "position": { "x": 2, "y": 3 },

            "max_jumps": 2,
            "jumps_remaining": 2,

            "ships": [
                {
                    "design": "dd1",
                    "current_hp": 150,
                    "max_hp": 200
                }
            ]

        }
    ]
}

// TODO: why is systemName an array?

// placeholder get system data
let gameSettings = GameSettings;
let galaxy = new Galaxy(gameSettings.galaxyWidget);
let systemData = JSON.parse(galaxy.systems[0].toJson());
console.log('systemData: ')
console.log(systemData)
// let systemRepresentation = new SystemRepresentation(systemData);
// console.log(systemRepresentation)
// debugger;

// types of state
//   config settings (game settings, widget settings)
//   widget pointers
//     - DOM References (dom)
//     - scene objects (sceneObjects)
//   game data
//     - current state: galaxy class > systems list > system class > system data
//     - new state: galaxy data JSON
//

let config = gameSettings.spaceViewWidget;
let clientObjects = {};

clientObjects.consoleDiv = document.getElementById("console-message");
clientObjects.lowerConsoleDiv = document.getElementById("lower-console");

let spaceViewWidget = new SpaceViewWidget(config, clientObjects, systemData);
window.spaceViewWidget = spaceViewWidget; // debugging

function draw() {
    spaceViewWidget.draw();
    window.requestAnimationFrame(draw);
}

await spaceViewWidget.beginGame();

draw();
