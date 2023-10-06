import { Entity } from './entity.js'

export class Planet extends Entity {
    constructor(data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'planet';
        this.name = systemName + " " + (this.index + 1);
        this.assetPath = "/assets/orbitals/meshes/planetbasemodel.glb";
        this.texturePath = "/assets/orbitals/textures/earthlike/" + this.atmosphere + ".png";
        this.cloudMeshPath = "/assets/orbitals/meshes/cloudlayer.glb";
        this.cloudTexturePath = "/assets/orbitals/textures/clouds/" + this.cloud_type + ".png";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/oxygen_thumbnail.png";
        this.position = { x: 0, y: 0, z: 2 * this.distance_from_star };
        this.consoleBody = `
            <div>Mediocre (x2)</div>
            <div>Population: 7/8</div>
            <div>Habitability: :)</div>
            `;
        this.object3ds = {};
    }

    toJSON() {
        return ({
            index: this.index,
            atmosphere: this.atmosphere,
            cloud_type: this.cloud_type,
            size: this.size,
            distance_from_star: this.distance_from_star,
            spin_speed: this.spin_speed,
            starting_angle: this.starting_angle
        });
    }

    update(elapsedTime) {
        for (var key in this.object3ds) {
            const obj3d = this.object3ds[key];

            // update rotation
            // negative for rotating counter-clockwise
            const spinImprover = obj3d.isClouds ? 2 : 1;
            obj3d.rotation.y = -0.3 * this.spin_speed * spinImprover * elapsedTime;

            // update revolution
            // speed is determined by distance from star without randomness
            const speedMultiplier = 3;
            const d = this.distance_from_star;
            // square of the planet's orbital period is proportional to the cube of its semimajor axis
            // pow(d, 3) = pow(period, 2), velocity = pow(1/d, 0.5), Math.pow(1/d, 0.5)

            let angle = elapsedTime * Math.pow(speedMultiplier / d, 2) + this.starting_angle;
            obj3d.position.x = d * Math.cos(angle);
            obj3d.position.z = d * Math.sin(angle);
        };

    }

}
