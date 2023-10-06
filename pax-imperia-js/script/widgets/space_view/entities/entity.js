import * as THREE from 'three';
import { getBasePath, unpackData } from '../../../models/helpers.js'

export default class Entity {

    /** @type {THREE.Object3D} */
    object3d;

    constructor(data, systemName = "", systemId) {
        this.type = "";
        this.size = 1;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.systemId = systemId;
        this.data = data;
        this.consoleBody = '';
        this.basePath = getBasePath();
        unpackData(data, this);
        this.scale = { x: this.size, y: this.size, z: this.size };
    }

    toJSON() {
        return ({
            index: this.index,
            atmosphere: this.atmosphere,
            size: this.size,
            distance_from_star: this.distance_from_star,
            spin_speed: this.spin_speed,
            starting_angle: this.starting_angle
        });
    }

    /**
     * Links the object3d with the entity so each can refer to one another.
     * @param {THREE.object3d} object3d - the clickable object3d associated
     *                                    with this entity
     */
    linkObject3d(object3d) {
        this.object3d = object3d;
        object3d.parentEntity = this;
    }

    /**
     * Sets the coordinates to draw the object3d for this entity.  This should be
     * called after first loading the Object3d so it isn't drawn at (0,0,0).
     * @param {THREE.Object3D} object3d
     */
    setLoadAttributes(object3d) {
        object3d.position.set(this.position.x, this.position.y, this.position.z);
        // rotation is in radians
        object3d.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        object3d.scale.set(this.scale.x, this.scale.y, this.scale.z);
        object3d.name = this.name;
        if (object3d.children[0]) {
            object3d.children[0].name = this.name;
        }
    }

    /////////////////////////////////
    // Unselect and Remove Methods //
    /////////////////////////////////

    unselect() {
        // TODO: remove spaceViewDomManager global
        if (window.spaceViewDomManager.selectionSprite.selectionTarget == this.object3d) {
            window.spaceViewDomManager.unselectTarget();
        }
    }

    /**
     * Remove Object3d from scene e.g. when ship colonizes planet or jumps through wormhole
     */
    removeObject3d() {
        this.unselect()
        // delete 3d object from scene
        this.object3d.parent.remove(this.object3d);
    }

    removeFromSystem(galaxy) {
        // delete entity from system object
        // find index of entity in list of entities in system
        const systemEntities = galaxy.systems[this.systemId][this.type + 's']
        const i = systemEntities.findIndex(x => x.name === this.name);
        // remove from list of entities in system
        systemEntities.splice(i, 1);
        // update sidebar
        window.spaceViewDomManager.populateHtml();
    }

    /////////////////////
    // Console Methods //
    /////////////////////

    returnConsoleTitle() {
        return '<div>' + this.type.toUpperCase() + ': ' + this.name + '</div>';
    }

    returnConsoleHtml() {
        let html = '';
        html += this.returnConsoleTitle();
        html += this.consoleBody;
        return html;
    }
}
