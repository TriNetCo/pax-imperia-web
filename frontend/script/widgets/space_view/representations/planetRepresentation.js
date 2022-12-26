import { EntityRepresentation } from './entityRepresentation.js'

export class PlanetRepresentation extends EntityRepresentation {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'planet';
        this.name = systemName + " " + (this.index + 1);
        this.assetPath = "/assets/" + this.atmosphere + ".gltf";
        this.position = {x: 0, y: 0, z: 2 * this.distance_from_star};
    }
}
