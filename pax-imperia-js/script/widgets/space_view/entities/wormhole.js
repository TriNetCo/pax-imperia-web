import { Entity } from './entity.js'
import * as THREE from 'three';

export class Wormhole extends Entity {
    constructor(data, systemName, systemId, systemPosition) {
        super(data, systemName, systemId);
        // id: 20
        // name: "Regor"
        // position: { x: 783, y: 378, z: 0.94 }
        this.type = 'wormhole';
        this.assetPath = "/assets/wormholes/wormhole.png";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/wormhole_thumbnail.png";
        // this.size = 0.3;
        this.size = 3;
        this.scale = { x: this.size, y: this.size, z: this.size };
        // this.position is in Galactic View coordinates
        // this.position = {x: -20, y: relativeZ, z: -10};
        this.position = this.calculateWormholeProjection(this.position, systemPosition);
    }

    calculateWormholeProjection(wormholePosition, systemPosition) {
        // fix wormhole depths to -50 behind system
        const wormholeZ = -50;
        // cap from -30 to 0
        const wormholeY = Math.max(-30,
            Math.min((systemPosition.y - wormholePosition.y - 30) * 0.5, 0));
        const wormholeX = (wormholePosition.x - systemPosition.x) * 0.5;
        return { x: wormholeX, y: wormholeY, z: wormholeZ };
    }

    update(elapsedTime) {
        return;
    }

}
