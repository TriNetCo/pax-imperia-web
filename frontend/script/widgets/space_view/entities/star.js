import { Entity } from './entity.js'

export class Star extends Entity {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'star';
        this.name = systemName;
        this.assetPath = "/assets/sun.gltf";
    }
}