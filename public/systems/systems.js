import * as THREE from 'three';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/loaders/FBXLoader.js";

import { SpriteFlipbook } from '/script/models/spriteFlipbook.js'

var t = 0;


const renderer = new THREE.WebGLRenderer();

const width = 800;
const height = 600;
renderer.setSize( width, height );
renderer.setPixelRatio( renderer.domElement.devicePixelRatio );
document.getElementById("canvas-div").appendChild( renderer.domElement );

const consoleSpan = document.getElementById("console-message");
const lowerConsoleSpan = document.getElementById("lower-console");

// Click detection
let raycaster = new THREE.Raycaster();
window.pointer = new THREE.Vector2(0,0);

const scene = new THREE.Scene();

////////////////
// Add Lights //
////////////////

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

///////////////////
// Add    Camera //
///////////////////

const camera = new THREE.PerspectiveCamera( 15, width / height, 1, 10000 );
camera.position.set( 0, 100, 0 );
camera.lookAt( scene.position );
camera.aspect = 800 / 600;
camera.updateProjectionMatrix();

var earthScene;

const loader = new GLTFLoader();


loader.load( '/assets/CloudyPlanet.gltf', function ( gltf ) {

    ///////////////
    // Add earth //
    ///////////////
    const objName = "earth";
    earthScene = gltf.scene;
    // earthScene.scale.set(1.1,1.1,1.1)
    earthScene.position.set(0,0,20);
    earthScene.name = objName;
    earthScene.children[0].name = objName
    scene.add( earthScene );

    console.log("Finished loading!");

}, function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {
    console.error( error );
} );

loader.load( '/assets/CloudyPlanet.gltf', function ( gltf ) {

    ///////////////
    // Add earth //
    ///////////////
    const objName = "earth2";
    const earth2Scene = gltf.scene;
    // earth2Scene.scale.set(1.1,1.1,1.1)
    earth2Scene.position.set(1,0,1);
    earth2Scene.name = objName;
    earth2Scene.children[0].name = objName
    scene.add( earth2Scene );

    console.log("Finished loading!");

}, function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {
    console.error( error );
} );


const fbxLoader = new FBXLoader()
fbxLoader.load(
    '/script/assets/GalacticLeopard6.fbx',
    (object) => {
        // object.traverse(function (child) {
        //     if ((child as THREE.Mesh).isMesh) {
        //         // (child as THREE.Mesh).material = material
        //         if ((child as THREE.Mesh).material) {
        //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
        //         }
        //     }
        // })
        let scale = 0.0002;
        object.name = "ship";
        object.scale.set(scale, scale, scale);
        object.rotation.set(2* Math.PI, 1.5708 ,2*Math.PI/4);
        object.position.set(0,1,0);
        scene.add(object);
        console.log("finished loading!");
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
        console.log(error);
    }
)


var sunScene;

loader.load( '/assets/Sun.gltf', function ( gltf ) {
    const objName = "sun";
    sunScene = gltf.scene;
    sunScene.name = objName + "Scene";
    sunScene.children[0].name = objName
    sunScene.position.set(0, 0, 0);
    scene.add( sunScene );
    selectionSprite.select(sunScene);

}, function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {
    console.error( error );
} );


const selectionSprite = new SpriteFlipbook(
    scene,
    '/script/assets/sprite_sheets/selection_sprite_sheet.png', 
    1,  // nCols in sprite sheet
    10, // nRows
    0.04); // loopFrameDuration

window.selectionSprite = selectionSprite;

// Add Box for Mouse...
const boxGeometry = new THREE.BoxGeometry(1,1,1);
const boxMaterial = new THREE.LineBasicMaterial( { color: 'red' } );
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add( boxMesh );


const clock = new THREE.Clock();
function animate() {
    let deltaTime = clock.getDelta();
    //boxMesh.position.set(pointer.x, 0, pointer.y);

    selectionSprite.update(deltaTime);

    t += 1/480;
    if (earthScene != undefined) {
        earthScene.position.x = 10*Math.cos(t) + 0;
        //earthScene.position.y = 5*Math.cos(t) + 0;
        earthScene.position.z = 10*Math.sin(t) + 0;

        //earthScene.rotation.y += 0.005;
    }

    renderer.render( scene, camera );
    requestAnimationFrame(animate);
}

animate();

function onPointerMove( event ) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    renderer.domElement;

    const h = renderer.domElement.height;
    const w = renderer.domElement.width;
    pointer.x = (event.offsetX / w) * 2 - 1;
    pointer.y = -(event.offsetY / h) * 2 + 1;

    // console.log("x : " + pointer.x + " y : " + pointer.y);
    var msg = "";
    msg = "pointer.x, y = { " + pointer.x + ", " + pointer.y + " }";
    // consoleSpan.innerHTML = msg;

    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children );


    // if ( intersects.length > 0) {
    //     let msg = "HIT: ";
    //     for ( let i = 0; i < intersects.length; i ++ ) {
    //         const obj = intersects[i].object;

    //         // debugger;
    //         console.log(obj);
    //         console.log(obj.name);

    //         msg +=  ", " + obj.name ;

    //         // intersects[ i ].object.material.color.set( 0xff0000 );
    //     }
    //     lowerConsoleSpan.innerHTML = msg + " {" + pointer.x + ", " + pointer.y + "}";
    // } else {
    //     lowerConsoleSpan.innerHTML = "Lower Console";
    // }

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
            if (obj.name == "selectionSprite") continue;
            msg +=  ", " + obj.name + " (" + obj.id + ")";

            // if (obj.name == "GalacticLeopard6") {
            //     alert('The ship was clicked!');
            // }

            // removeContainerFromScene(obj);
            putCursorOverContainer(obj);
        }
        // lowerConsoleSpan.innerHTML = msg + " {" + pointer.x + ", " + pointer.y + "}";
    } else {
        // lowerConsoleSpan.innerHTML = "Lower Console";
    }
    
    console.log("CLICKED");
}


/* This function recursively walks up the tree of parents until it finds the root scene
    * and removes the highest order group from that scene.  
    */
function removeContainerFromScene(container) {
    if (container == null) return;
    let parent = container.parent;

    if (parent.type == "Scene") {
        console.log("Deleting object at (" + container.position.x 
        + ", " + container.position.y
        + ", " + container.position.z + ")");
        parent.remove(container);
    }
    removeContainerFromScene(container.parent);
}

function putCursorOverContainer(container) {
    if (container == null) return;
    let parent = container.parent;

    if (parent.type == "Scene") {
        selectionSprite.select(container);
        lowerConsoleSpan.innerHTML = "Selected: " + container.name;
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