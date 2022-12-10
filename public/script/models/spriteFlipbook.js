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
        let scale = 4;
        this.sprite.scale.set(scale,scale);
        this.sprite.name = "selectionSprite";
        scene.add( this.sprite );
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
        if (  this.loopFrameDuration > 0 && 
              this.elapsedTime >= this.loopFrameDuration ) {
            this.elapsedTime = 0;
            this.currentTile = (this.currentTile + 1 ) % this.tilesVert;
            this.map.offset.y = (this.tilesVert - this.currentTile - 1 ) / this.tilesVert;
        }

    }

    setPosition(x, y, z) {
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        this.sprite.position.z = z;
    }

}