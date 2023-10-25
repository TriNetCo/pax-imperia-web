import Entity from './entity.js'
import * as THREE from 'three';

export class Wormhole extends Entity {

    /** @type {THREE.Sprite} */
    textSprite;

    /**
     *
     * @param {Object} config
     * @param {Object} config.srcSystemPosition
     * @param {Object} config.dstSystemPosition
     * @param {string} config.id
     * @param {string} config.name
     * @param {string} config.toId
     * @param {string} config.fromId
     */
    constructor(config) {
        super(config);
        this.type = 'wormhole';
        this.name = '???';
        this.assetPath = "/assets/wormholes/wormhole.png";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/wormhole_thumbnail.png";
        this.size = 3;
        this.scale = { x: this.size, y: this.size, z: this.size };
        this.position = this.calculateWormholeProjection(config.dstSystemPosition, config.srcSystemPosition);
        this.known = false;
    }

    toJSON() {
        return ({
            id: this.id,
            name: this.name,
            fromId: this.fromId,
            toId: this.toId,
            srcSystemPosition: this.srcSystemPosition,
            dstSystemPosition: this.dstSystemPosition,
        });
    }

    calculateWormholeProjection(wormholePosition, systemPosition) {
        // fix wormhole depths to -50 behind system
        const wormholeZ = -50;
        // cap from -30 to 0
        const minY = -50;
        const maxY = -10;
        const wormholeY = Math.max(minY,
            Math.min(maxY, (systemPosition.y - wormholePosition.y - 60) * 0.5));
        const minX = -30;
        const maxX = 30;
        const wormholeX = Math.max(minX,
            Math.min(maxX, (wormholePosition.x - systemPosition.x) * 0.5));
        return { x: wormholeX, y: wormholeY, z: wormholeZ };
    }

    update(elapsedTime) {
        return;
    }
}
