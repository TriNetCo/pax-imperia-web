import { Colony } from "./colony";

const config = {
    startingPopulation: 1000,
    startingBuildings: {
        'housing': 2,
        'farm': 1,
    },
    availableBuildings: {
        'housing': {
            label: 'Housing',
            buildingType: 'housing',
            cost: { 'wood': 100 },
            capacity: 1000,
            unit: 'people'
        },
        'farm': {
            label: 'Farm',
            buildingType: 'workplace',
            cost: { 'wood': 100 },
            capacity: 500,
            unit: 'farm'
        }
    }
};

test('colony removeWorkAllocationsOverCapacity works', () => {
    const colony = new Colony(1, null, 0, config);
    colony.workAllocation = {
        'farm': 10000,
        'gather': 0,
        'foo': 0
    };
    colony.workplaceCapacities = { 'farm': 500, 'gather': 100 };

    colony.removeWorkAllocationsOverCapacity();

    expect(colony.workAllocation).toEqual({
        'farm': 500,
        'gather': 0,
        'foo': 0
    });
});

test('colony removeWorkAllocationsOverPopulation works', () => {
    const colony = new Colony(1, null, 0, config);
    colony.workAllocation = { 'farm': 600, 'gather': 600 };
    colony.orderOfWork = ['farm', 'gather'];

    colony.removeWorkAllocationsOverPopulation();

    expect(colony.workAllocation).toEqual({
        'farm': 600,
        'gather': 400,
    });
});

test('colony autoAllocateWork works', () => {
    const colony = new Colony(1, null, 0, config);
    colony.workAllocation = {
        'farm': 5,
        'mine': 5
    };
    colony.workplaceCapacities = { 'farm': 500, 'gather': 1000, 'mine': 100 };
    colony.orderOfWork = ['farm', 'gather', 'mine'];

    colony.autoAllocateWork();

    expect(colony.workAllocation).toEqual({
        'farm': 500,
        'gather': 495,
        'mine': 5,
    });
});
