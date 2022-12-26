import { EntityRepresentation } from './entityRepresentation.js'

export class ShipRepresentation extends EntityRepresentation {
    constructor (data, systemName) {
        super(data, systemName);
        this.type = 'ship';
        this.name = "ship";
        this.assetPath = '/script/assets/GalacticLeopard6.fbx';
        this.size = 0.0002;
        this.scale = {x: this.size, y: this.size, z: this.size};
        this.position = {x: 0, y: 4, z: 4};
        // this.rotation = {x: 2* Math.PI, y: 1.5708, z: 2*Math.PI/4};
        this.rotation = {x: 0.7, y: -1.6, z: 0.4};
    }
}
