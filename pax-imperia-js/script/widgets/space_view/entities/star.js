import { Entity } from './entity.js'

export class Star extends Entity {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'star';
        this.name = systemName;
        this.assetPath = "/assets/planets/sun.gltf";
    }

    update (elapsedTime) {
        this.object3d.rotation.y = 0.3 * elapsedTime;
        this.object3d.rotation.x = 0.3 * elapsedTime;
    }

}
