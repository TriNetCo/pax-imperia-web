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

    /** @type {THREE.Object3D}  */
    selectionTarget;

    /** @type {Entity} */
    selectionEntity;

    constructor(scene, spriteTexture, tilesHoriz, tilesVert, loopFrameDuration) {
        this.tilesHoriz = tilesHoriz;
        this.tilesVert = tilesVert;
        this.scene = scene;
        this.loopFrameDuration = loopFrameDuration;

        const map = new THREE.TextureLoader().load(spriteTexture);
        this.map = map;
        map.magFilter = THREE.NearestFilter;
        map.repeat.set(1 / tilesHoriz, 1 / tilesVert);
        map.offset.x = 0;
        map.offset.y = (this.currentTile % tilesVert) / tilesVert;

        const material = new THREE.SpriteMaterial({
            map: map,
            transparent: true,
            opacity: 0.5,
        });
        const sprite = new THREE.Sprite(material);
        this.sprite = sprite;
        sprite.notClickable = true;
        const scale = 4;
        sprite.scale.set(scale, scale);
        sprite.name = "selectionSprite";
        sprite.visible = false;
        scene.add(sprite);
    }

    update(deltaTime) {
        // UpdateSelectionTarget
        const selectionTarget = this.selectionTarget;
        if (selectionTarget != null) {
            this.sprite.visible = true;
            const p = selectionTarget.position;
            this.setPosition(p.x, p.y, p.z);
            if (selectionTarget.parentEntity.type == "ship") {
                this.setScale({ x: 1, y: 1, z: 1 });
            } else {
                this.setScale(selectionTarget.scale);
            }
        } else {
            this.sprite.visible = false;
        }

        // cycleSpriteFlipbook
        this.elapsedTime += deltaTime;
        if (this.loopFrameDuration > 0 &&
            this.elapsedTime >= this.loopFrameDuration) {
            this.elapsedTime = 0;
            this.currentTile = (this.currentTile + 1) % this.tilesVert;
            this.map.offset.y = (this.tilesVert - this.currentTile - 1) / this.tilesVert;
        }

    }

    setPosition(x, y, z) {
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        this.sprite.position.z = z;
    }

    setScale(scale) {
        this.sprite.scale.set(scale.x * 4, scale.y * 4, scale.z * 4);
    }

    setPositionVector3(vector3) {
        this.sprite.position = vector3;
    }

    /**
     * Selects an object3d to be highlighted by the selection sprite.
     *
     * @param {THREE.Object3D} selectionTarget
     */
    select(selectionTarget) {
        window.target = selectionTarget.parentEntity;
        this.selectionTarget = selectionTarget;
        this.selectionEntity = selectionTarget.parentEntity;
    }

    /**
     * Removes the highlighting and selection from the HUD.
     */
    unselect() {
        this.selectionTarget = null;
        this.selectionEntity = null;
    }

}
