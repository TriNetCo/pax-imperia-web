import * as THREE from 'three';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/FBXLoader.js";

import { SpriteFlipbook } from '/script/models/spriteFlipbook.js'


///////////////////////
// Connect DOM Stuff //
///////////////////////

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
function loadPlanet(name, modelPath, x, y, z) {
    return new Promise(function(resolve, reject) {
        loader.load(modelPath, function ( gltf ) {
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


////////////////////
// Setup Renderer //
////////////////////

const renderer = new THREE.WebGLRenderer();

const width = 800;
const height = 500;
renderer.setSize( width, height );
renderer.setPixelRatio( renderer.domElement.devicePixelRatio );
document.getElementById("canvas-div").appendChild( renderer.domElement );

// Click detection
let raycaster = new THREE.Raycaster();
window.pointer = new THREE.Vector2(0,0);


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

// Add earth

var earthScene = await loadPlanet("earth", '/assets/CloudyPlanet.gltf', 0,0,20);
var earth2Scene = await loadPlanet("earth2", '/assets/CloudyPlanet.gltf', 1,0,1);
var sunScene = await loadPlanet("sun", '/assets/Sun.gltf', 0,0,0);

var ship = await loadShip('ship', '/script/assets/GalacticLeopard6.fbx', 0, 1, 0)

function doRotationsAndOrbits(deltaTime) {
    spinTime += deltaTime/9 ;
    earthScene.position.x = 10*Math.cos(spinTime) + 0;
    earthScene.position.z = 10*Math.sin(spinTime) + 0;

    earthScene.rotation.y += 0.005;

    sunScene.rotation.y += 0.005;
    sunScene.rotation.x += 0.005;
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

renderer.domElement.addEventListener( 'pointermove', onPointerMove );
renderer.domElement.addEventListener( 'click', onPointerClick );

// DRAW BOX

// const boxGeometry = new THREE.BoxGeometry(1,1,1);
// const boxMaterial = new THREE.LineBasicMaterial( { color: 'red' } );
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add( boxMesh );

// // DRAW LINE
// const points = [];
// points.push( new THREE.Vector3( - 10, 0, 0 ) );
// points.push( new THREE.Vector3( 0, 10, 0 ) );
// points.push( new THREE.Vector3( 10, 0, 0 ) );

// const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
// const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
// const line = new THREE.Line( lineGeometry, lineMaterial );
// scene.add( line );

// // DRAW SPHERE
// const geometry = new THREE.SphereGeometry( 15, 32, 16 );
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// const sphere = new THREE.Mesh( geometry, material );
// scene.add( sphere );