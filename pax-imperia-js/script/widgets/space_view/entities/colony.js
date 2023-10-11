export class Colony {

    constructor(player, planet, startTime, colonyConfig) {
        this.player = player;
        this.planet = planet;
        this.startTime = startTime;
        this.lastUpdated = startTime;
        this.population = colonyConfig?.startingPopulation || defaulColonyConfig.startingPopulation;
        this.food = colonyConfig?.startingFood || defaulColonyConfig.startingFood;
        this.wood = colonyConfig?.startingWood || defaulColonyConfig.startingWood;
        this.metal = colonyConfig?.startingMetal || defaulColonyConfig.startingMetal;
        this.populationCapacity = colonyConfig?.populationCapacity || defaulColonyConfig.populationCapacity;
        this.foodStorageCapacity = colonyConfig?.foodStorageCapacity || defaulColonyConfig.foodStorageCapacity;
        this.woodStorageCapacity = colonyConfig?.woodStorageCapacity || defaulColonyConfig.woodStorageCapacity;
        this.growthRate = colonyConfig?.growthRate || defaulColonyConfig.growthRate;
        this.foodConsumptionRate = colonyConfig?.foodConsumptionRate || defaulColonyConfig.foodConsumptionRate;
        this.foodProductionRate = colonyConfig?.foodProductionRate || defaulColonyConfig.foodProductionRate;
        this.woodGatherRate = colonyConfig?.woodGatherRate || defaulColonyConfig.woodGatherRate;
        this.buildRate = colonyConfig?.buildRate || defaulColonyConfig.buildRate;
        this.workAllocation = colonyConfig?.workAllocation || defaulColonyConfig.workAllocation;
        this.buildingsTypes = colonyConfig?.buildingsTypes || defaulColonyConfig.buildingsTypes;
        this.buildings = colonyConfig?.startingBuildings || defaulColonyConfig.startingBuildings;
        this.populationCapacity = this.getPopulationCapacity();
        this.foodStorageCapacity = this.getFoodStorageCapacity();
        this.woodStorageCapacity = this.getWoodStorageCapacity();

    }

    update(time) {
        const deltaTimeMinutes = (time - this.lastUpdated) / 60;
        const tick = 1 / 60;
        if (deltaTimeMinutes < tick) {
            return;
        }
        const cycles = Math.floor(deltaTimeMinutes / tick);
        for (let i = 0; i < cycles; i++) {
            this.handleServerTick(tick);
        }
        this.lastUpdated += cycles * tick * 60;

        window.spaceViewDomManager.populateConsoleBody();
    }

    handleServerTick(tick) {
        this.populationCapacity = this.getPopulationCapacity();
        this.foodStorageCapacity = this.getFoodStorageCapacity();
        this.woodStorageCapacity = this.getWoodStorageCapacity();
        let population = this.getPopulation(tick);
        let food = this.getFood(tick, population);
        ({ food, population } = this.eatFood(food, population, tick));
        this.food = food;
        this.population = population;
    }

    getPopulation(deltaTimeMinutes) {
        let population = (1 + this.growthRate * deltaTimeMinutes) * this.population;
        if (population > this.populationCapacity) {
            console.log('Not enough housing');
            population = this.populationCapacity;
        }
        return population;
    }

    getPopulationCapacity() {
        return this.buildings.housing * this.buildingsTypes.housing.capacity;
    }

    getFoodStorageCapacity() {
        return this.buildings.foodStorage * this.buildingsTypes.foodStorage.capacity;
    }

    getWoodStorageCapacity() {
        return this.buildings.woodStorage * this.buildingsTypes.woodStorage.capacity;
    }

    getFood(deltaTimeMinutes, population) {
        let food = this.food +
            this.workAllocation.farm.allocation *
            population * this.foodProductionRate *
            deltaTimeMinutes;
        return food;
    }

    eatFood(food, population, deltaTimeMinutes) {
        let foodEaten = this.foodConsumptionRate * deltaTimeMinutes * population;
        if (food < foodEaten) {
            let deaths = 0.5 * food / foodEaten * deltaTimeMinutes * population;
            console.log('Not enough food', deaths);
            food = 0;
            population -= deaths;
        } else {
            food -= foodEaten;
            if (food > this.foodStorageCapacity) {
                console.log('Not enough food storage');
                food = this.foodStorageCapacity;
            }
        }
        return { food, population };
    }

    // getFood(deltaTimeMinutes) {
    //     const foodProduced = this.workAllocation.farm * this.foodProductionRate * deltaTimeMinutes;
    //     // const food = this.food + this.workAllocation.farm * this.foodProductionRate * deltaTimeMinutes - this.foodConsumptionRate * this.population * deltaTime;
    //     return Math.min(food, this.foodStorageCapacity);
    // }
}

const defaulColonyConfig = {
    startingPopulation: 1000,
    startingFood: 1000,
    startingWood: 0,
    startingMetal: 0,
    growthRate: 0.05, // per minute
    foodConsumptionRate: 1, // per population per minute
    foodProductionRate: 2, // per minute
    woodGatherRate: 5, // per minute
    buildRate: 1, // per minute
    workAllocation: {
        'farm': { label: 'Farm', allocation: 1 },
        'gather': { label: 'Gather', allocation: 0 },
        'build': { label: 'Build', allocation: 0 },
        'research': { label: 'Research', allocation: 0 }
    },
    startingBuildings: {
        'housing': 2,
        'farm': 1,
        'foodStorage': 2,
        'woodStorage': 1,
    },
    buildingsTypes: {
        'housing': { label: 'Housing', cost: { 'wood': 100 }, capacity: 1000 },
        'farm': { label: 'Farm', cost: { 'wood': 100 }, capacity: 500 },
        'mine': { label: 'Mine', cost: { 'wood': 100 }, capacity: 500 },
        'foodStorage': { label: 'Food Storage', cost: { 'wood': 100 }, capacity: 1000 },
        'woodStorage': { label: 'Wood Storage', cost: { 'wood': 100 }, capacity: 1000 },
        'metalStorage': { label: 'Metal Storage', cost: { 'wood': 100 }, capacity: 1000 },
        'college': { label: 'College', cost: { 'wood': 100 }, capacity: 50 },
    }
}