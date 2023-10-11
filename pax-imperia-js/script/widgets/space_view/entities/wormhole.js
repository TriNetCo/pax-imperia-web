import Entity from './entity.js'
import * as THREE from 'three';

export class Wormhole extends Entity {

    /** @type {THREE.Sprite} */
    textSprite;

    constructor(data, systemName, systemId, systemPosition) {
        super(data, systemName, systemId);
        this.name = '???';
        this.type = 'wormhole';
        this.assetPath = "/assets/wormholes/wormhole.png";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/wormhole_thumbnail.png";
        // this.size = 0.3;
        this.size = 3;
        this.scale = { x: this.size, y: this.size, z: this.size };
        // this.position is in Galactic View coordinates
        // this.position = {x: -20, y: relativeZ, z: -10};
        this.position = this.calculateWormholeProjection(this.toPosition, systemPosition);
        this.known = false;
    }

    toJSON() {
        return ({
            id: this.id,
            name: this.name,
            fromId: this.fromId,
            toId: this.toId,
            toPosition: this.toPosition,
        });
    }

    calculateWormholeProjection(wormholePosition, systemPosition) {
        // fix wormhole depths to -50 behind system
        const wormholeZ = -50;
        // cap from -30 to 0
        const minY = -30;
        const maxY = 0;
        const wormholeY = Math.max(minY,
            Math.min(maxY, (systemPosition.y - wormholePosition.y - 30) * 0.5));
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
