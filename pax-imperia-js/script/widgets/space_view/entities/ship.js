import { Entity } from './entity.js'

export class Ship extends Entity {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'ship';
        this.name = "ship";
        this.assetPath = '/assets/ships/GalacticLeopard6.fbx';
        this.assetThumbnailPath = "/assets/thumbnails/ship_thumbnail.png";
        this.size = 0.0002;
        this.scale = {x: this.size, y: this.size, z: this.size};
        this.position = {x: -1.5, y: 2.6, z: 6};
        // this.rotation = {x: 2* Math.PI, y: 1.5708, z: 2*Math.PI/4};
        this.rotation = {x: 0.7, y: -1.6, z: 0.4};
    }
}
