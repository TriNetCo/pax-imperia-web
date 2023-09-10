import { Entity } from './entity.js'

export class Planet extends Entity {
    constructor (data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'planet';
        this.name = systemName + " " + (this.index + 1);
        this.assetPath = "/assets/planets/" + this.atmosphere + ".gltf";
        this.assetThumbnailPath = "/assets/thumbnails/" + this.atmosphere + "_thumbnail.png";
        this.position = {x: 0, y: 0, z: 2 * this.distance_from_star};
    }

    update (elapsedTime) {
        let speedMultiplier = 3;

        this.object3d.rotation.y = 0.3 * elapsedTime;

        let d = this.distance_from_star;
        // square of the planet's orbital period is proportional to the cube of its semimajor axis
        // pow(d, 3) = pow(period, 2), velocity = pow(1/d, 0.5), Math.pow(1/d, 0.5)
        let angle = elapsedTime * Math.pow(speedMultiplier/d, 2) + this.starting_angle;
        this.object3d.position.x = d * Math.cos(angle);
        this.object3d.position.z = d * Math.sin(angle);
    }
}
