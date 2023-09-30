import { Entity } from './entity.js'
import * as THREE from 'three';

export class Wormhole extends Entity {
    constructor(data, systemName, systemId, systemPosition) {
        super(data, systemName, systemId);
        // id: 20
        // name: "Regor"
        // position: { x: 783, y: 378, z: 0.94 }
        this.type = 'wormhole';
        // this.assetPath = this.basePath + "/assets/planets/sun.gltf";
        this.assetPath = this.basePath + "/assets/wormholes/wormhole.png";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/wormhole_thumbnail.png";
        // this.size = 0.3;
        this.size = 1.5;
        this.scale = { x: this.size, y: this.size, z: this.size };
        // this.position is in Galactic View coordinates
        // this.position = {x: -20, y: relativeZ, z: -10};
        this.position = this.calculateWormholeProjection(this.position, systemPosition);
    }

    calculateWormholeProjection(wormholePosition, systemPosition) {
        // fix wormhole depths to -10 behind system
        let wormholeZ = -10;
        // up-down position (y) in system detail view system view
        // is equivalent to z in galazy view
        let wormholeY = wormholePosition.z - systemPosition.z;

        // Map 360 deg circle around current star to plane behind current star
        // Can see wormholes set to X -20 to 20
        // Avoid middle which can be blocked by star, max size is 3.5
        // +Y, -X -> atan(y/x) = -0 to -pi/2 -> -20 to -12
        // +Y, +X -> atan(y/x) = pi/2 to 0 -> -12 to -4
        // -Y, +X -> atan(y/x) = -0 to -pi/2 -> 4 to 12
        // -Y, -X -> atan(y/x) = pi/2 to 0 -> 12 to 20

        // calculate X, Y relative to current star
        let relativeX = wormholePosition.x - systemPosition.x;
        // y coords swapped because down is positive in Galaxy View (0, 0 is top left)
        let relativeY = systemPosition.y - wormholePosition.y;
        // arctan is the angle of the wormhole relative to current star
        let angle = Math.atan(relativeY / relativeX);
        let wormholeX = 0;
        if (relativeY >= 0) {
            if (relativeX >= 0) {
                wormholeX = this.getScaledNumber(angle, Math.PI / 2, 0, -12, -5);
            } else {
                wormholeX = this.getScaledNumber(angle, 0, -Math.PI / 2, -19, -12);
            };
        } else {
            if (relativeX >= 0) {
                wormholeX = this.getScaledNumber(angle, 0, -Math.PI / 2, 5, 12);
            } else {
                wormholeX = this.getScaledNumber(angle, Math.PI / 2, 0, 12, 19);
            };
        };

        return { x: wormholeX, y: wormholeY, z: wormholeZ };
    }

    getScaledNumber(input, minInput, maxInput, minOutput, maxOutput) {
        let inputPercent = (input - minInput) / (maxInput - minInput);
        let output = inputPercent * (maxOutput - minOutput) + minOutput;
        return output;
    }

    update(elapsedTime) {
        return;
    }

}
