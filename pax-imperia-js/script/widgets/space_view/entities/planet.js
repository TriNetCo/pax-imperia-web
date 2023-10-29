import { Colony } from './colony.js';
import Entity from './entity.js'

export class Planet extends Entity {

    /** @type {Colony} */
    colony;

    constructor(data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'planet';
        this.name = systemName + " " + (this.number + 1);
        this.assetPath = "/assets/orbitals/meshes/planetbasemodel.glb";
        this.texturePath = "/assets/orbitals/textures/earthlike/" + this.atmosphere + ".png";
        this.cloudMeshPath = "/assets/orbitals/meshes/cloudlayer.glb";
        this.cloudTexturePath = "/assets/orbitals/textures/clouds/" + this.cloud_type + ".png";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/oxygen_thumbnail.png";
        this.position = { x: 0, y: 0, z: 2 * this.distance_from_star };
        this.consoleBody = '';
    }

    toJSON() {
        return ({
            id: this.id,
            number: this.number,
            atmosphere: this.atmosphere,
            cloud_type: this.cloud_type,
            size: this.size,
            distance_from_star: this.distance_from_star,
            spin_speed: this.spin_speed,
            starting_angle: this.starting_angle
        });
    }

    update(elapsedTime) {
        const logs = [];

        // update the group (planet, clouds, outline)

        // update rotation
        // negative for rotating counter-clockwise
        this.object3d.rotation.y = -0.3 * this.spin_speed * elapsedTime;

        // update revolution
        // speed is determined by distance from star without randomness
        // square of the planet's orbital period is proportional to the cube of its semimajor axis
        // pow(d, 3) = pow(period, 2), velocity = pow(1/d, 0.5), Math.pow(1/d, 0.5)
        const speedMultiplier = 3;
        const d = this.distance_from_star;
        let angle = elapsedTime * Math.pow(speedMultiplier / d, 2) + this.starting_angle;
        this.object3d.position.x = d * Math.cos(angle);
        this.object3d.position.z = d * Math.sin(angle);

        // update the cloud's rotation within the group
        // clouds are rotating twice as fast because their cumulative rotation
        // is the group's rotation + their own rotation
        this.object3ds.cloud.rotation.y = -0.3 * this.spin_speed * elapsedTime;

        if (this.colony) {
            const colonyLogs = this.colony.update(elapsedTime);
            logs.push(...colonyLogs);
        }

        return logs;
    }

    getConsoleHtml() {
        const colonizedBy = this.colony?.playerId || 'Uninhabited';
        const population = Math.floor(this.colony?.population || 0);
        let html = '';
        html += this.returnConsoleTitle();
        html += `
            <div>
                <div>Player: ${colonizedBy}</div><br/>`;
        if (this.colony && this.colony?.playerId == 1) {
            html += this.colony.getColonyStatsHtml();
            html += this.colony.getBuildingStatsHtml()
        } else {
            html += `<div>Population: ${population}</div>`;
        }
        html += `</div>`;
        html += this.consoleBody;
        return html;
    }

    getStaticConsoleHtml() {
        let html = '';
        if (this.colony && this.colony.playerId == 1) {
            html += this.colony.getWorkAllocationHtml();
            html += this.colony.getBuildHtml();
        }
        return html;
    }
}
