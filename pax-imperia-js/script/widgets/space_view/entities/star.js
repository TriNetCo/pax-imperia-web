import { Entity } from './entity.js'

export class Star extends Entity {
    constructor(data, systemName, systemId) {
        super(data, systemName, systemId);
        this.type = 'star';
        this.name = systemName;
        this.assetPath = this.basePath + "/assets/planets/sun.gltf";
        this.assetThumbnailPath = this.basePath + "/assets/thumbnails/sun_thumbnail.png";
    }

    update(elapsedTime) {
        const rotation = 0.3 * this.spin_speed * elapsedTime;
        this.object3d.rotation.y = rotation;
        this.object3d.rotation.x = rotation;
    }

}
