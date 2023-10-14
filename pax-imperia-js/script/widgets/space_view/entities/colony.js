import { capitalizeFirstLetter } from "../../../models/helpers.js";

export class Colony {

    constructor(playerId, planet, startTime, colonyConfig) {
        this.playerId = playerId;
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
        this.availableBuildings = colonyConfig?.availableBuildings || defaulColonyConfig.availableBuildings;
        this.buildings = colonyConfig?.startingBuildings || defaulColonyConfig.startingBuildings;
        this.defaultOrderOfWork = ['build', 'farm', 'mine', 'research', 'gather'];
        this.orderOfWork = [];
        this.housingCapacities = {};
        this.workplaceCapacities = {};
        this.resourceCapacities = {};
        this.workAllocation = {};
        this.useAutoAssign = false;
        this.logs = [];
        this.newLogs = [];
        this.setCapacities();
        this.autoAllocateWork();
    }

    setCapacities() {
        // clear capacities
        this.housingCapacities = {};
        this.workplaceCapacities = {};
        this.resourceCapacities = {};

        Object.entries(this.availableBuildings).forEach(([key, value]) => {
            // calculate capacity based on number of each building
            const capacity = Math.floor(this.buildings[key] * value.capacity) || 0;

            // get the capacities object for the building type
            let capacities = this.housingCapacities;
            if (value.buildingType == 'workplace') capacities = this.workplaceCapacities;
            if (value.buildingType == 'storage') capacities = this.resourceCapacities;

            // add to existing total or create a new entry
            capacities[value.unit] = capacities[value.unit] + capacity || capacity;
        });

        // no building required to gather wood so set to population
        this.workplaceCapacities.gather = Math.floor(this.population);

        // filter out work types from prioritization order that have no capacity
        this.orderOfWork = this.defaultOrderOfWork.filter(
            work => this.workplaceCapacities[work] > 0
        );
    }

    update(time) {
        this.time = time;
        const deltaTimeSeconds = (time - this.lastUpdated);
        const tick = 1;
        if (deltaTimeSeconds < tick) {
            return [];
        }
        const cycles = Math.floor(deltaTimeSeconds / tick);
        for (let i = 0; i < cycles; i++) {
            this.handleServerTick(tick);
        }
        this.lastUpdated += cycles * tick;

        const newLogs = this.newLogs;
        this.newLogs = [];
        // only return logs for the current player
        if (this.playerId == 1) { return newLogs; }
        return [];
    }

    handleServerTick(tick, time) {
        this.setCapacities();
        this.wood = this.getWood(tick);
        let population = this.getPopulation(tick);
        let food = this.getFood(tick, population);
        ({ food, population } = this.eatFood(food, population, tick));
        this.food = food;
        this.population = population;
        this.balanceWorkAllocation();
        if (this.autoAllocateWork) {
            this.autoAllocateWork();
        }
    }

    getPopulation(deltaTimeSeconds) {
        let population = (1 + this.growthRate * deltaTimeSeconds) * this.population;
        if (population > this.housingCapacities.people) {
            this.pushLog('Not enough housing');
            population = this.housingCapacities.people;
        }
        return population;
    }

    getFood(deltaTimeSeconds) {
        let food = this.food +
            this.workAllocation.farm *
            this.foodProductionRate *
            deltaTimeSeconds;
        return food;
    }

    eatFood(food, population, deltaTimeSeconds) {
        let foodEaten = this.foodConsumptionRate * deltaTimeSeconds * population;
        if (food < foodEaten) {
            let deaths = (food / foodEaten) * population *
                deltaTimeSeconds;
            this.pushLog('Not enough food');
            console.log('Not enough food', deaths);
            food = 0;
            population -= deaths;
        } else {
            food -= foodEaten;
            if (food > this.resourceCapacities.food) {
                this.pushLog('Not enough food storage');
                food = this.resourceCapacities.food;
            }
        }
        return { food, population };
    }

    getWood(deltaTimeSeconds) {
        let wood = this.wood +
            this.workAllocation.gather *
            this.woodGatherRate *
            deltaTimeSeconds;
        if (wood > this.resourceCapacities.wood) {
            this.pushLog('Not enough wood storage');
            wood = this.resourceCapacities.wood;
        }
        return wood;
    }

    getColonyStatsHtml() {
        const html = `<div>Population: ${Math.floor(this.population)} / ${this.housingCapacities.people}</div>
            <div>Food: ${Math.floor(this.food)} / ${this.resourceCapacities.food}</div>
            <div>Wood: ${Math.floor(this.wood)} / ${this.resourceCapacities.wood}</div>`
        return html;
    }

    getBuildingStatsHtml() {
        let html = 'BUILDINGS';
        Object.entries(this.buildings).forEach(([type, count]) => {
            html += `<div>${this.availableBuildings[type].label}: ${count}</div>`;
        });
        return html;
    }

    getWorkAllocationHtml() {
        const workAllocation = this.workAllocation;
        const totalWorkAllocation = this.getTotalWorkAllocation(this.workAllocation);
        const population = Math.floor(this.population);
        const autoAssignCheck = this.useAutoAssign ? 'checked' : '';
        let html = `
            <div><br/>
                WORK
                <button id="assign" onclick="handleAssignButton()">Assign</button>
                <input type="checkbox" id="auto-assign" name="auto-assign" onclick="handleAutoAssign(this.checked)" ${autoAssignCheck}>
                <label for="auto-assign-check">Auto-assign new workers</label>
            </div>
            <table>`;
        for (let i = 0; i < this.orderOfWork.length; i++) {
            const work = this.orderOfWork[i];
            const label = capitalizeFirstLetter(work);
            const allocation = Math.floor(workAllocation[work] || 0);
            const maxAllocation = Math.min(this.workplaceCapacities[work], population);
            html += `
                    <tr>
                        <td style="text-align:left;">
                            ${label}
                        </td>
                        <td>
                            <input id="assign${work}" name="assign${work}" type="range" min="0" max="${maxAllocation}" step="1" value="${allocation}" oninput="handleWorkSlider(this.value, '${work}')"/>
                        </td>
                        <td width="45px" style="text-align:right;">
                            <span id="${work}value">${allocation}</span>
                        </td>
                        <td>/</td>
                        <td style="text-align:right;">${maxAllocation} </td>
                    </tr>`

        }
        html += `<td/>
            <td/>
            <td style="text-align:right;"><span id="total-workers">${totalWorkAllocation}</span></td>
            <td>/</td>
            <td style="text-align:right;">${population}</td>
            </table></div>`;
        return html;
    }

    getTotalWorkAllocation(workAllocation) {
        let total = 0;
        Object.entries(workAllocation).forEach(([key, value]) => {
            total += Number(value);
        });
        return total;
    }

    setNewWorkAllocation(workAllocation) {
        // normalize to total population
        let totalWorkAllocation = this.getTotalWorkAllocation(workAllocation);
        if (totalWorkAllocation > Math.floor(this.population)) {
            const multiplier = this.population / totalWorkAllocation;
            for (var work in workAllocation) {
                workAllocation[work] = Math.floor(workAllocation[work] * multiplier);
            }
        }
        this.workAllocation = workAllocation;
    }

    autoAllocateWork() {
        const totalWorkAllocation = this.getTotalWorkAllocation(this.workAllocation);
        const population = Math.floor(this.population);
        let remainingAllocation = population - totalWorkAllocation;

        if (remainingAllocation <= 0) {
            return;
        }

        // assign excess population to the first work type that has room
        for (let i = 0; i < this.orderOfWork.length; i++) {
            const work = this.orderOfWork[i];
            const currentAllocation = this.workAllocation[work] || 0;
            const maxAllocation = Math.min(this.workplaceCapacities[work] || 0, population);
            const additionalAllocation = Math.min(remainingAllocation, maxAllocation - currentAllocation);
            this.workAllocation[work] = this.workAllocation[work] + additionalAllocation || additionalAllocation;
            remainingAllocation -= additionalAllocation;
            if (remainingAllocation <= 0) {
                break;
            }
        }
    }

    balanceWorkAllocation() {
        this.removeWorkAllocationsOverCapacity();
        this.removeWorkAllocationsOverPopulation()

    }

    removeWorkAllocationsOverCapacity() {
        for (const work in this.workAllocation) {
            const maxAllocation = this.workplaceCapacities[work] || 0;
            if (this.workAllocation[work] > maxAllocation) {
                this.workAllocation[work] = maxAllocation;
            }
        }
    }

    removeWorkAllocationsOverPopulation() {
        const totalWorkAllocation = this.getTotalWorkAllocation(this.workAllocation);
        const population = Math.floor(this.population);

        // remove excess from work types in reverse order of priority
        if (totalWorkAllocation > population) {
            let excessWorkers = totalWorkAllocation - population;
            for (let i = this.orderOfWork.length - 1; i >= 0; i--) {
                const work = this.orderOfWork[i];
                if (this.workAllocation[work]) {
                    const currentAllocation = this.workAllocation[work] || 0;
                    const additionalAllocation = Math.min(currentAllocation, excessWorkers);
                    this.workAllocation[work] -= additionalAllocation;
                    excessWorkers -= additionalAllocation;
                    if (excessWorkers <= 0) {
                        break;
                    }
                }
            }
        }
    }

    pushLog(message) {
        const existingLog = this.logs.find(log => log.message == message);
        const existingNewLog = this.newLogs.find(log => log == message);
        if (!existingLog) {
            this.logs.push({ message: message, timestamp: this.time });
            if (!existingNewLog) {
                this.newLogs.push(this.planet.name + ' - ' + message);
            }
        } else if (existingLog?.timestamp < this.time - 60) {
            existingLog.timestamp = this.time;
            if (!existingNewLog) {
                this.newLogs.push(this.planet.name + ' - ' + message);
            }
        }
    }

}

const defaulColonyConfig = {
    startingPopulation: 1000,
    startingFood: 1000,
    startingWood: 0,
    startingMetal: 0,
    growthRate: 0.001, // per second
    foodConsumptionRate: 0.016, // per population per second
    foodProductionRate: 0.032, // per second
    woodGatherRate: 0.032, // per second
    buildRate: 0.01, // per second
    startingBuildings: {
        'housing': 2,
        'farm': 1,
        'foodStorage': 2,
        'woodStorage': 1,
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
        },
        'mine': {
            label: 'Mine',
            buildingType: 'workplace',
            cost: { 'wood': 100 },
            capacity: 500,
            unit: 'mine'
        },
        'college': {
            label: 'College',
            buildingType: 'workplace',
            cost: { 'wood': 100 },
            capacity: 50,
            unit: 'research'
        },
        'foodStorage': {
            label: 'Food Storage',
            buildingType: 'storage',
            cost: { 'wood': 100 },
            capacity: 1000,
            unit: 'food'
        },
        'woodStorage': {
            label: 'Wood Storage',
            buildingType: 'storage',
            cost: { 'wood': 100 },
            capacity: 1000,
            unit: 'wood'
        },
        'metalStorage': {
            label: 'Metal Storage',
            buildingType: 'storage',
            cost: { 'wood': 100 },
            capacity: 1000,
            unit: 'metal'
        },
    }
}