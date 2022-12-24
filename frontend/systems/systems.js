import { SpaceViewWidget } from '/script/widgets/space_view/spaceViewWidget.js'
import { GameSettings } from '/script/gameSettings.js';
import { Galaxy } from '/script/models/galaxy.js';

///////////////////////
// Input System Data //
///////////////////////

let system = {
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

let c = GameSettings.galaxyWidget;
let galaxy = new Galaxy(c);
system = galaxy.systems[0];

// types of state
//   config settings (game settings, widget settings)
//   widget pointers
//     - DOM References (dom)
//     - scene objects (sceneObjects)
//   game data
//     - current state: galaxy class > systems list > system class > system data
//     - new state: galaxy data JSON
//

let settings = {};

settings.system = system;
settings.consoleDiv = document.getElementById("console-message");
settings.lowerConsoleDiv = document.getElementById("lower-console");

let spaceViewWidget = new SpaceViewWidget(settings);
window.spaceViewWidget = spaceViewWidget; // debugging

await spaceViewWidget.beginGame();

function draw() {
    spaceViewWidget.draw();
    window.requestAnimationFrame(draw);
}

draw();


