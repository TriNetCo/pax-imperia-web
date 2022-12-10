import * as THREE from 'three';

/**
 * This class provides to functionality to animate sprite sheets.
 */
export class SpriteFlipbook {

    constructor(scene, spriteTexture, tilesHoriz, tilesVert, loopFrameDuration) {
        this.currentTile = 0;
        this.tilesHoriz = tilesHoriz;
        this.tilesVert = tilesVert;
        this.scene = scene;

        this.loopFrameDuration = loopFrameDuration;
        this.elapsedTime = 0;

        let map = new THREE.TextureLoader().load( spriteTexture );
        this.map = map;
        map.magFilter = THREE.NearestFilter;
        map.repeat.set(1/tilesHoriz, 1/tilesVert);
        map.offset.x = 0;
        map.offset.y = (this.currentTile % tilesVert) / tilesVert;

        this.material = new THREE.SpriteMaterial( { map: map } );
        this.sprite = new THREE.Sprite( this.material );
        this.sprite.position.set(0,20,0);
        let scale = 4;
        this.sprite.scale.set(scale,scale);
        scene.add( this.sprite );
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
        if (  this.loopFrameDuration > 0 && 
              this.elapsedTime >= this.loopFrameDuration ) {
            this.elapsedTime = 0;
            this.currentTile = (this.currentTile + 1 ) % this.tilesVert;
            this.map.offset.y = (this.tilesVert - this.currentTile - 1 ) / this.tilesVert;
            console.log("currentTile: " + this.currentTile);
            console.log("map.offset.y: " + this.map.offset.y);
        }

    }

}