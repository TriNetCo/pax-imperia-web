import { Entity } from './entity.js'
import * as THREE from 'three';

function makeTextSprite(message, opts) {
    var parameters = opts || {};
    var fontface = parameters.fontface || 'Helvetica';
    var fontsize = parameters.fontsize || 20;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    // text color
    context.fillStyle = 'rgba(255, 255, 255, 1.0)';
    context.fillText(message, 0, fontsize);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set( 10, 5, 1.0 );
    sprite.center.set( 0,1 );
    return sprite;
}

export class Wormhole extends Entity {
    constructor (data, systemName, systemPosition) {
        super(data, systemName);
        // id: 20
        // name: "Regor"
        // position: { x: 783, y: 378, z: 0.94 }
        this.type = 'wormhole';
        this.assetPath = "/assets/sun.gltf";
        this.size = 0.2;
        this.scale = {x: this.size, y: this.size, z: this.size};
        this.position = {x: -7, y: this.position.z - systemPosition.z, z: -10};
        console.log(this.position);
    }

    addWormholeText (scene) {
        let sprite = makeTextSprite(this.name || 'Sector' + this.id);
        //
        //let sprite = new THREE.TextSprite( {
        //    text: 'Wormhole',
        //    alignment: 'center',
        //    fontFamily: 'Arial, Helvetica, sans-serif',
        //    fontSize: 28,
        //    color: '#ffffff' } );
        scene.add( sprite );
        sprite.position.set(this.position.x, this.position.y, this.position.z);
    }

    update (elapsedTime) {
        return;
    }

}
