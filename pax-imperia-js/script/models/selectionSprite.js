import * as THREE from 'three';
import { Queue } from './helpers.js';

/**
 * This class provides functionality around animating sprite sheets.
 */
export class SelectionSprite {

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
        this.spriteTexture = spriteTexture;
        this.tilesHoriz = tilesHoriz;
        this.tilesVert = tilesVert;
        this.scene = scene;
        this.loopFrameDuration = loopFrameDuration;
        this.previousTargets = new Queue(3);
    }

    loadGraphics() {
        const map = new THREE.TextureLoader().load(this.spriteTexture);
        this.map = map;
        map.magFilter = THREE.NearestFilter;
        map.repeat.set(1 / this.tilesHoriz, 1 / this.tilesVert);
        map.offset.x = 0;
        map.offset.y = (this.currentTile % this.tilesVert) / this.tilesVert;

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
        this.scene.add(sprite);
    }

    update(deltaTime) {
        const selectionTarget = this.selectionTarget;

        if (!selectionTarget) {
            this.sprite.visible = false;
        }
        else if (!this.scene.children.includes(selectionTarget)) {
            this.unselect();
            this.sprite.visible = false;
        }
        else {
            this.sprite.visible = true;
            const p = selectionTarget.position;
            this.setPosition(p.x, p.y, p.z);
            this.setScale(selectionTarget.scale);
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


    /////////////////////
    // SELECTION LOGIC //
    /////////////////////

    /**
     * Selects an object3d to be highlighted by the selection sprite.
     *
     * @param {THREE.Object3D} selectionTarget
     */
    select(selectionTarget) {
        this.previousTargets.push(selectionTarget);
        this.selectionTarget = selectionTarget;
        this.selectionEntity = selectionTarget.parentEntity;
        if (typeof window !== 'undefined') {
            window.target = selectionTarget.parentEntity;
            window.selectionTarget = this.selectionTarget;
        }
    }

    /**
     * Removes the highlighting and selection from the HUD.
     */
    unselect() {
        this.previousTargets.push(null);
        this.selectionTarget = null;
        this.selectionEntity = null;
        if (typeof window !== 'undefined') {
            window.target = null;
            window.selectionTarget = null;
        }
    }

    getPreviousTarget(i) {
        // will only return target if target is still in scene
        const target = this.previousTargets[i];
        if (this.scene.children.includes(target)) {
            return target;
        } else {
            return null;
        }
    }

}
