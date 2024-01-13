import Entity from './entity.js'
import { Colony } from './colony.js';
import * as THREE from 'three';

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
        // update the group (planet, clouds, outline)
        this.object3d.position.copy(this.getPosition(elapsedTime));
        this.object3d.rotation.copy(this.getRotation(elapsedTime));

        // update the cloud's rotation within the group
        // clouds are rotating twice as fast because their cumulative rotation
        // is the group's rotation + their own rotation
        this.object3ds.cloud.rotation.y = -0.3 * this.spin_speed * elapsedTime;

        const logs = [];
        if (this.colony) {
            const colonyLogs = this.colony.update(elapsedTime);
            logs.push(...colonyLogs);
        }

        ///////////////////////////////////////////////
        // HACK: Tell react about a potential change //
        ///////////////////////////////////////////////

        if (typeof window !== 'undefined') {
            const modalEntity = window.modal.objectInfoEntity;
            if (modalEntity?.id == this.id) {
                window.modal.updateEntity(this.presentData());
            }
        }

        return logs;
    }

    presentData() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            atmosphere: this.atmosphere,
            colony: this.colony?.presentData(),
        }
    }

    getPosition(elapsedTime) {
        // update revolution
        // speed is determined by distance from star without randomness
        // square of the planet's orbital period is proportional to the cube of its semimajor axis
        // pow(d, 3) = pow(period, 2), velocity = pow(1/d, 0.5), Math.pow(1/d, 0.5)
        const speedMultiplier = 3;
        const angle = elapsedTime
            * Math.pow(speedMultiplier / this.distance_from_star, 2)
            + this.starting_angle;
        const x = this.distance_from_star * Math.cos(angle);
        const z = this.distance_from_star * Math.sin(angle);
        return new THREE.Vector3(x, 0, z);
    }

    getRotation(elapsedTime) {
        // negative for rotating counter-clockwise
        const y = -0.3 * this.spin_speed * elapsedTime;
        return new THREE.Euler(0, y, 0);
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
