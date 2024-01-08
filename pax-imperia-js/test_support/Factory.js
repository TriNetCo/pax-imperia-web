import * as THREE from 'three';

import { Planet } from "../script/widgets/space_view/entities/planet";
import {GameStateInterface} from '../script/gameStateInterface/gameStateInterface';
import {Ship} from '../script/widgets/space_view/entities/ship';

const websocket = {
    send: () => { },
    onmessage: () => { }
};

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


export const createMockGameStateInterface = (config) => {
    const gameStateInterface = new GameStateInterface( {...config });
    gameStateInterface.spaceViewWidget = {
        system: config.galaxy.systems[1],
        spaceViewDomManager: {
            populateHtml: () => { },
            selectTarget: () => { },
        },
        spaceViewAnimator: {
            addOutline: () => { },
        },
    };

    gameStateInterface.addEventLogEntry = () => { };
    return gameStateInterface;
}


export const createTestShip = (config) => {
    const ship = new Ship();
    ship.object3d = {
        position: createMockPosition(config),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        lookAt: () => { },
        rotateOnAxis: () => { },
    };
    ship.systemId = 0;
    ship.id = 0;
    ship.speed = 1;

    return ship;
};
