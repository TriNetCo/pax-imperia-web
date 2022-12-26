import { EntityRepresentation } from './entityRepresentation.js'

export class StarRepresentation extends EntityRepresentation {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'star';
        this.name = systemName;
        this.assetPath = "/assets/sun.gltf";
    }
}