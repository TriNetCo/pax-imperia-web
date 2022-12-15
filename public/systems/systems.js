import * as THREE from 'three';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/FBXLoader.js";

import { SpriteFlipbook } from '/script/models/spriteFlipbook.js'


///////////////////////
// Input System Data //
///////////////////////

var system = {
    "id": "1",
    "name": "Rigel",
    "g_position": { "x": 1, "y": 1 },
    "planets": [
        {
            "index": 0,
            "atmosphere": "sun",
            "size": 5,
            "distance_from_star": 0,
            "spin_speed": 1,
            "rander": 5  /* This is a random number where the planet's orbit begins so they aren't all rotating in sync with each other. */
        },
        {
            "index": 1,
            "atmosphere": "oxygen",
            "size": 5,
            "distance_from_star": 1,
            "spin_speed": 2,
            "rander": 10
        },
        {
            "index": 2,
            "atmosphere": "oxygen",
            "size": 5,
            "distance_from_star": 2,
            "spin_speed": 3,
            "rander": 40
        },
        {
            "index": 3,
            "atmosphere": "oxygen",
            "size": 4,
            "distance_from_star": 3,
            "spin_speed": 4,
            "rander": 78
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


////////////////////
// Setup Renderer //
////////////////////

const renderer = new THREE.WebGLRenderer();

const width = 800;
const height = 500;
renderer.setSize( width, height );
renderer.setPixelRatio( renderer.domElement.devicePixelRatio );

// Click detection
let raycaster = new THREE.Raycaster();
window.pointer = new THREE.Vector2(0,0);


///////////////////////
// Connect DOM Stuff //
///////////////////////

document.getElementById("canvas-div").appendChild( renderer.domElement );
renderer.domElement.addEventListener( 'pointermove', onPointerMove );
renderer.domElement.addEventListener( 'click', onPointerClick );

const upperConsole = {
    print(msg) {
        document.getElementById("console-message").innerHTML = msg;
    }
}

const lowerConsole = {
    print(msg) {
        document.getElementById("lower-console").innerHTML = msg;
    }
}

const slider = document.getElementById("slider");


/////////////////////////////
// Model Loading Functions //
/////////////////////////////
// TODO: Move to their own class...

/* 
 * Load Planet
 */
function loadPlanet(name, atmosphere, x, y, z) {
    return new Promise(function(resolve, reject) {
        loader.load("/assets/" + atmosphere + ".gltf", function ( gltf ) {
            let obj = gltf.scene;
            // obj.scale.set(1.1,1.1,1.1)
            obj.position.set(x,y,z);
            obj.name = name;
            obj.children[0].name = name
            scene.add( obj );
            console.log("Finished loading!");
            resolve(obj);
        }, function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        }, function ( error ) {
            console.error( error );
        } );

    });
}

/* 
 * Load Ship
 */
function loadShip(name, modelPath, x, y, z) {
    return new Promise(function(resolve, reject) {
        fbxLoader.load(
            modelPath,
            (object) => {
                let scale = 0.0002;
                object.name = name;
                object.scale.set(scale, scale, scale);
                object.rotation.set(2* Math.PI, 1.5708 ,2*Math.PI/4);
                object.position.set(x,y,z);
                scene.add(object);
                console.log("finished loading!");
                resolve(object)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.log(error);
            }
        )
    });
}


////////////////////////////////////////
// Setup the Scene with Basic Objects //
////////////////////////////////////////

const scene = new THREE.Scene();

// Add Lights

var light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set(22, 22, 25);
light.lookAt(0,0,0);
scene.add( light );

light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set(2, 2, 5);
light.lookAt(0,0,0);
scene.add( light );

light = new THREE.AmbientLight( 0xffffff, 0.1 );
scene.add( light );

// Add Camera

const camera = new THREE.PerspectiveCamera( 15, width / height, 1, 10000 );
camera.position.set( 0, 100, 0 );
camera.lookAt( scene.position );


/////////////////
// Load Models //
/////////////////

const loader = new GLTFLoader();
const fbxLoader = new FBXLoader()


///////////////////
// loadPlanets() //
///////////////////

for (const planet of system['planets']) {
    const z = 2 * planet['distance_from_star'];

    console.log("loading planet with atmosphere: " + planet['atmosphere']);
    let planetObject = await loadPlanet("" + planet["index"], planet['atmosphere'], 0,0,z);
    planet['planet_object'] = planetObject;
}

var ship = await loadShip('ship', '/script/assets/GalacticLeopard6.fbx', 0, 1, 0)

function doRotationsAndOrbits(deltaTime) {
    spinTime += deltaTime/9 ;

    for (const planet of system['planets']) {
        let planetObject = planet.planet_object;

        planetObject.rotation.y += 0.005;

        let d = planet["distance_from_star"];
        if (d == 0) {
            planetObject.rotation.x += 0.005;
            continue;
        }
        let r = d*3;
        let rander = planet["rander"];

        planetObject.position.x = r*Math.cos(spinTime + rander) + 0;
        planetObject.position.z = r*Math.sin(spinTime + rander) + 0;
        
    }

}

// Load sprites

const selectionSprite = new SpriteFlipbook(
    scene,
    '/script/assets/sprite_sheets/selection_sprite_sheet.png', 
    1,  // nCols in sprite sheet
    10, // nRows
    0.04); // loopFrameDuration

window.selectionSprite = selectionSprite;


//////////////////////////////////
// Setup Animation/ Update Loop //
//////////////////////////////////

let spinTime = 0;
const clock = new THREE.Clock();
function animate() {

    // Reset camera in real time
    //////////////////////////////

    // let myVal = slider.value;
    // let dist = 0.5;
    // camera.position.set( dist * 150, dist * 100, dist * 179 );
    // camera.lookAt( scene.position );
    // camera.updateProjectionMatrix();

    let deltaTime = clock.getDelta();

    selectionSprite.update(deltaTime); // UpdateSpriteFrame

    doRotationsAndOrbits(deltaTime);

    renderer.render( scene, camera );
    requestAnimationFrame(animate);
}


/////////////
// Main... //
/////////////

upperConsole.print("Resume");


////////////////////////////////////
// Populate HTML based on JS data //
////////////////////////////////////

populatePlanetList(system);
window.system = system;

function populatePlanetList(system) {
    let planetListUl = document.getElementById("planet-list");
    let html = "<h3>Planets:</h3>";
    html += "<ul>";
    let name = system["name"];

    system["planets"].forEach( planet => {
        let index = planet["index"];
        let planetFullName = name + " " + index;

        html += "<li onclick='alert(\"hi\")''>" + planetFullName + "</li>";

    });

    html += "</ul>";
    planetListUl.innerHTML = html;
}



animate();

function onPointerMove( event ) {
    trackMousePosition(event)
}

/* This method runs whenever the pointer move event fires so 
 * we can tell canvas where our mouse is
 */ 
function trackMousePosition(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    const h = renderer.domElement.height;
    const w = renderer.domElement.width;
    pointer.x = (event.offsetX / w) * 2 - 1;
    pointer.y = -(event.offsetY / h) * 2 + 1;
}

function onPointerClick( event ) {
    event.preventDefault();
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0) {

        let uniqueIntersects = intersects.filter( (value, index, self) => {
            return self.findIndex(v => v.object.id === value.object.id) === index;
        });

        let msg = "HIT: ";
        for ( let i = 0; i < uniqueIntersects.length; i ++ ) {
            const obj = uniqueIntersects[i].object;
            msg +=  ", " + obj.name + " (" + obj.id + ")";

            // removeContainerFromScene(obj);
            putCursorOverContainer(obj);
        }
        // lowerConsole.print(msg + " {" + pointer.x + ", " + pointer.y + "}");
    } else {
        // lowerConsole.print("Lower Console");
    }
    
}


/* This function recursively walks up the tree of parents until it finds the root scene
 * and removes the highest order group from that scene.  
 */
function removeContainerFromScene(container) {
    let parent = container.parent;

    if (parent.type == "Scene") {
        console.log("Deleting object at (" + container.position.x 
        + ", " + container.position.y
        + ", " + container.position.z + ")");
        parent.remove(container);
    } else {
        removeContainerFromScene(container.parent);
    }
}

function putCursorOverContainer(container) {
    if (container.name == "selectionSprite") return; // Never put a cursor over the cursor itself
    let parent = container.parent;

    if (parent.type == "Scene") {
        selectionSprite.select(container);
        lowerConsole.print("Selected: " + container.name);
    } else {
        putCursorOverContainer(parent)
    }
}


