

export const createMockPosition = (config) => {
    const defaults = {
        x: 0,
        y: 0,
        z: 0,
        distanceTo: () => 0,
        copy: () => null
    };

    return { ...defaults, ...config };
}


export const createMockPlanet = () => {
    return ({
        type: 'planet',
        id: 1,
        name: 'planet',
        object3d: {
            position: createMockPosition(),
            scale: { x: 1, y: 1, z: 1 }
        }
    });
}

