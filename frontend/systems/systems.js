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

const distanceSlider = document.getElementById("distance-slider");
const xSlider = document.getElementById("x-slider");
const ySlider = document.getElementById("y-slider");
const zSlider = document.getElementById("z-slider");


/////////////////////////////
// Model Loading Functions //
/////////////////////////////
// TODO: Move to their own class...

/*
 * Load Planet
 */


function loadObject3d(name,
                      assetPath,
                      scale = {x: 1, y: 1, z: 1},
                      position = {x: 0, y: 0, z: 0},
                      rotation = {x: 0, y: 0, z: 0}
                      ) {
    return new Promise(function(resolve, reject) {
        loader.load(assetPath, function ( gltf ) {
            let obj = gltf.scene;
            obj.position.set(position.x, position.y, position.z);
            obj.rotation.set(rotation.x, rotation.y, rotation.z); // x, y, z radians
            obj.scale.set(scale.x, scale.y, scale.z);
            obj.name = name;
            obj.children[0].name = name;
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

function loadStar(name, size) {
    console.log("loading star")
    let assetPath = "/assets/sun.gltf";
    let position = {x: 0, y: 0, z: 0};
    let scale = {x: size, y: size, z: size};
    return loadObject3d(name, assetPath, scale, position)
}

function loadPlanet(name, atmosphere, size, z) {
    console.log("loading planet " + name + " with atmosphere " + atmosphere)
    let assetPath = "/assets/" + atmosphere + ".gltf";
    let position = {x: 0, y: 0, z: z};
    let scale = {x: size, y: size, z: size};
    return loadObject3d(name, assetPath, scale, position)
}

// function loadShip() {
//    console.log("loading ship")
//    let name = "ship"
//    let assetPath = '/script/assets/GalacticLeopard6.fbx';
//    let size = 0.0002;
//    let scale = {x: size, y: size, z: size}
//    let position = {x: 0, y: 4, z: 4}
//    let rotation = {x: 2* Math.PI, y: 1.5708, z: 2*Math.PI/4};
//    let loader = new FBXLoader()
//    return loadObject3d(name, assetPath, scale, position, rotation, loader)
// }

function loadShip(name, modelPath, x, y, z) {
    return new Promise(function(resolve, reject) {
        fbxLoader.load(
            modelPath,
            (object) => {
                let scale = 0.0002;
                object.name = name;
                object.scale.set(scale, scale, scale);
                object.rotation.set(2* Math.PI, 1.5708 ,2*Math.PI/4); // x, y, z radians
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

// var light = new THREE.DirectionalLight( 0xffffff, 1 );
// light.position.set(22, 22, 25);
// light.lookAt(0,0,0);
// scene.add( light );

// light = new THREE.DirectionalLight( 0xffffff, 1 );
// light.position.set(2, 2, 5);
// light.lookAt(0,0,0);
// scene.add( light );

var sunLight = new THREE.PointLight(new THREE.Color(), 1.25, 1000);
scene.add(sunLight);

var headLamp = new THREE.DirectionalLight( 0xffffff, 1 );
headLamp.position.set(22, 22, 25);
scene.add( headLamp );

//var ambientLight = new THREE.AmbientLight( 0xffffff, 0.05 );
//scene.add( ambientLight );

// Add Camera


const camera = new THREE.PerspectiveCamera( 15, width / height, 1, 10000 );
scene.add(camera);

var cameraLight = new THREE.PointLight(new THREE.Color(), .5, 10000);
scene.add(cameraLight);

camera.add(cameraLight);

scene.add(sunLight);

const cameraPivot = new THREE.Group();

scene.add(cameraPivot);

cameraPivot.add(camera);
camera.position.set(0, 0, 50);
camera.lookAt( scene.position );


/////////////////
// Load Models //
/////////////////

const loader = new GLTFLoader();
const fbxLoader = new FBXLoader()


///////////////////
// loadStarsAndPlanets() //
///////////////////

for (const star of system['stars']) {
    let name = star['name'];
    let object3d = await loadStar(name, star['size']);
    star['object3d'] = object3d;
    object3d.gameObject = star;

    let texture = object3d.children[0].material.map;
    object3d.children[0].material = new THREE.MeshBasicMaterial();
    object3d.children[0].material.map = texture;

}

for (const planet of system['planets']) {
    let name = "" + planet["index"]
    let size = planet['size'];
    let atmosphere = planet['atmosphere']
    let z = 2 * planet['distance_from_star'];
    let object3d = await loadPlanet(name, atmosphere, size, z);
    planet['object3d'] = object3d;
    object3d.gameObject = planet;
}

// var ship = await loadShip();
var ship = await loadShip('ship', '/script/assets/GalacticLeopard6.fbx', 0, 4, 4)
ship.object3d = {};
ship.gameObject = {}; // workaround for selectionBox


function doRotationsAndOrbits(deltaTime) {
    let speedMultiplier = 1; //1/9 to slow down the whole system
    spinTime += deltaTime * speedMultiplier;

    for (const starOrPlanet of system['stars'].concat(system['planets'])) {
        let object3d = starOrPlanet.object3d;

        object3d.rotation.y += 0.005;

        let d = starOrPlanet["distance_from_star"];
        if (d == 0) { // if the planet is the sun
            object3d.rotation.x += 0.005;
            continue;
        }
        let r = d*3;
        let startingPosition = starOrPlanet["starting_position"];

        // square of the planet's orbital period is proportional to the cube of its semimajor axis
        // pow(d, 3) = pow(period, 2), velocity = pow(1/d, 0.5), Math.pow(1/d, 0.5)
        object3d.position.x = r*Math.cos(spinTime * Math.pow(d, -2) + startingPosition) + 0;
        object3d.position.z = r*Math.sin(spinTime * Math.pow(d, -2) + startingPosition) + 0;

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
// uses client's clock for time info
// starts the clock when .getDelta() is called for the first time
const clock = new THREE.Clock();
function animate() {

    // Reset camera in real time
    //////////////////////////////

    let distance = distanceSlider.value;
    let xRotation = xSlider.value;
    let yRotation = ySlider.value;
    let zRotation = zSlider.value;

    // cameraPivot.rotation.set(xRotation, yRotation, 0.0);
    cameraPivot.rotation.set(-0.6, 0.05, -3);

    cameraPivot.position.set(0, 0, distance);
    camera.lookAt( scene.position );

    headLamp.position.set(0, 0, distance);
    // headLamp.lookAt(scene.position);

    ship.rotation.set(0.7, -1.6, 0.4);
    ship.position.set(zRotation, xRotation ,yRotation);


    camera.updateProjectionMatrix();

    // seconds since getDelta last called
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


