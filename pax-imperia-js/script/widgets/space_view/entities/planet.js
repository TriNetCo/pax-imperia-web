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
        this.object3ds = {};
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

        if (this.colony) {
            this.colony.update(elapsedTime);
        }

    }

    getConsoleHtml() {
        const colonizedBy = this.colony?.playerId || 'Uninhabited';
        const population = Math.floor(this.colony?.population || 0);
        let html = '';
        html += this.returnConsoleTitle();
        html += `
            <div>
                <div><br/>Player: ${colonizedBy}</div>`;
        if (this.colony && this.colony?.playerId == 1) {
            html += this.getColonyStatsHtml();
            html += this.getWorkAssignmentHtml();
        } else {
            html += `<div>Population: ${population}</div>`;
        }
        html += `</div>`;
        html += this.consoleBody;
        return html;
    }

    getColonyStatsHtml() {
        let html = `<div>Population: ${Math.floor(this.colony.population)} / ${this.colony.populationCapacity}</div>
            <div>Food: ${Math.floor(this.colony.food)} / ${this.colony.foodStorageCapacity}</div>
            <div>Wood: ${Math.floor(this.colony.wood)} / ${this.colony.woodStorageCapacity}</div>`
        return html;
    }

    getWorkAssignmentHtml() {
        const orderOfWork = ['farm', 'gather', 'build', 'research'];
        const workAllocation = this.colony.workAllocation;
        let html = `
            <div><br/><br/>
                Allocate work:
                <button id="assign" onclick="handleAssignButton()">Assign</button>
            </div>
            <table>`;
        for (let i = 0; i < orderOfWork.length; i++) {
            const work = orderOfWork[i];
            if (workAllocation[work]) {
                const label = workAllocation[work].label;
                const allocation = Math.round(workAllocation[work].allocation * 100);
                html += `
                    <tr>
                        <td style="text-align:left;">
                            ${label}
                        </td>
                        <td>
                            <input id="assign${work}" name="assign${work}" type="range" min="0" max="100" step="1" value="${allocation}" oninput="${work}value.value = this.value"/>
                        </td>
                        <td width="45px" style="text-align:right;">
                            <output id="${work}value" name="${work}value" for="assign${work}">${allocation}</output>%
                        </td>
                    </tr>`
            }
        }
        html += `</table></div>`;
        return html;
    }


}
