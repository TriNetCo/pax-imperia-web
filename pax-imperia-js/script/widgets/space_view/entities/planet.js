import { Entity } from './entity.js'

export class Planet extends Entity {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'planet';
        this.name = systemName + " " + (this.index + 1);
        this.assetPath = "/assets/" + this.atmosphere + ".gltf";
        this.position = {x: 0, y: 0, z: 2 * this.distance_from_star};
    }

    update (elapsedTime) {
        this.object3d.rotation.y = 0.3 * elapsedTime;

        let d = this.distance_from_star;
        let startingPosition = this.starting_position;

        // square of the planet's orbital period is proportional to the cube of its semimajor axis
        // pow(d, 3) = pow(period, 2), velocity = pow(1/d, 0.5), Math.pow(1/d, 0.5)
        this.object3d.position.x = 3*d*Math.cos(elapsedTime * Math.pow(d, -2) + startingPosition);
        this.object3d.position.z = 3*d*Math.sin(elapsedTime * Math.pow(d, -2) + startingPosition);
    }
}
