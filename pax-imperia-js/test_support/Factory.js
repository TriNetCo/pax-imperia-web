import * as THREE from 'three';

import { Planet } from "../script/widgets/space_view/entities/planet";


export const createMockPosition = (config) => {
    const defaults = {
        x: 0,
        y: 0,
        z: 0,
        distanceTo: () => 0,
        copy: () => null
    };
    const conf =  { ...defaults, ...config };
    return new THREE.Vector3(conf.x, conf.y, conf.z);
}


export const createMockPlanet = (positionConfig) => {
    const planet = new Planet();
    planet.object3d = {
        position: createMockPosition(positionConfig),
        scale: { x: 1, y: 1, z: 1 },
        parentEntity: planet,
    };
    return planet;
}

