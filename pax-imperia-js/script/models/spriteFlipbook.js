import * as THREE from 'three';

/**
 * This class provides to functionality to animate sprite sheets.
 */
export class SpriteFlipbook {

    currentTile = 0;
    elapsedTime = 0;
    map;
    material;
    sprite;
    selectionTarget = null;

    constructor(scene, spriteTexture, tilesHoriz, tilesVert, loopFrameDuration) {
        this.tilesHoriz = tilesHoriz;
        this.tilesVert = tilesVert;
        this.scene = scene;
        this.loopFrameDuration = loopFrameDuration;

        const map = new THREE.TextureLoader().load( spriteTexture );
        this.map = map;
        map.magFilter = THREE.NearestFilter;
        map.repeat.set(1/tilesHoriz, 1/tilesVert);
        map.offset.x = 0;
        map.offset.y = (this.currentTile % tilesVert) / tilesVert;

        const material = new THREE.SpriteMaterial( { map: map } );
        this.material = material;
        const sprite = new THREE.Sprite( material );
        this.sprite = sprite;
        let scale = 4;
        sprite.scale.set(scale,scale);
        sprite.name = "selectionSprite";
        scene.add( sprite );
    }

    update(deltaTime) {
        // UpdateSelectionTarget
        const selectionTarget = this.selectionTarget;
        if (selectionTarget != null) {
            this.sprite.visible = true;
            const p = selectionTarget.position;
            this.setPosition(p.x, p.y, p.z);
            if (selectionTarget.name == "ship") {
                this.setScale({ x: 1, y: 1, z: 1});
            } else {
                this.setScale(selectionTarget.scale);
            }
        } else {
            this.sprite.visible = false;
        }

        // cycleSpriteFlipbook
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

    setScale(scale){
        this.sprite.scale.set(scale.x*4, scale.y*4, scale.z*4);
    }

    setPositionVector3(vector3) {
        this.sprite.position = vector3;
    }

    select(selectionTarget) {
        this.selectionTarget = selectionTarget;
    }

    unselect() {
        this.selectionTarget = null;
    }

}
