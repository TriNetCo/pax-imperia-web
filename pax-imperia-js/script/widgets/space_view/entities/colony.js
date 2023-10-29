import { capitalizeFirstLetter } from "../../../models/helpers.js";

export class Colony {

    /**
     *
     * @param {Object} params
     * @param {number} params.id
     * @param {number} params.playerId
     * @param {number} params.planetId
     * @param {number} params.startTime
     * @param {number=} params.population
     * @param {Object=} params.resources
     * @param {Object=} params.buildings
     * @param {Array=} params.buildingQueue
     * @param {Object=} params.workAllocation
     * @param {Object=} params.colonyConfig
     */
    constructor(params) {
        this.id = params.id;
        this.playerId = params.playerId;
        this.planetId = params.planetId;
        this.startTime = params.startTime;
        this.lastUpdated = params.startTime;

        this.population = params?.startingPopulation || defaulColonyConfig.startingPopulation;
        this.resources = params?.startingResources || defaulColonyConfig.startingResources;
        this.buildings = params?.startingBuildings || defaulColonyConfig.startingBuildings;
        this.buildingQueue = params?.buildingQueue || [];
        this.workAllocation = params?.workAllocation || {};

        const colonyConfig = params.colonyConfig;
        this.populationCapacity = colonyConfig?.populationCapacity || defaulColonyConfig.populationCapacity;
        this.foodStorageCapacity = colonyConfig?.foodStorageCapacity || defaulColonyConfig.foodStorageCapacity;
        this.woodStorageCapacity = colonyConfig?.woodStorageCapacity || defaulColonyConfig.woodStorageCapacity;
        this.growthRate = colonyConfig?.growthRate || defaulColonyConfig.growthRate;
        this.foodConsumptionRate = colonyConfig?.foodConsumptionRate || defaulColonyConfig.foodConsumptionRate;
        this.foodProductionRate = colonyConfig?.foodProductionRate || defaulColonyConfig.foodProductionRate;
        this.woodGatherRate = colonyConfig?.woodGatherRate || defaulColonyConfig.woodGatherRate;
        this.buildRate = colonyConfig?.buildRate || defaulColonyConfig.buildRate;
        this.availableShips = colonyConfig?.availableShips || defaulColonyConfig.availableShips;
        this.availableBuildings = colonyConfig?.availableBuildings || defaulColonyConfig.availableBuildings;
        this.defaultOrderOfWork = ['build', 'farm', 'mine', 'research', 'gather'];
        this.orderOfWork = [];
        this.housingCapacities = {};
        this.workplaceCapacities = {};
        this.resourceCapacities = {};
        this.logs = [];
        this.newLogs = [];
        this.useAutoAssign = false;
        this.setCapacities();
        this.autoAllocateWork();
    }

    toJSON() {
        return ({
            id: this.id,
            playerId: this.playerId,
            planetId: this.planetId,
            startTime: this.startTime,
            lastUpdated: this.lastUpdated,

            resources: this.resources,
            population: this.population,
            buildings: this.buildings,
            buildingQueue: this.buildingQueue,
            workAllocation: this.workAllocation,
        });
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

        // add available spots for building from building queue
        this.buildingQueue.forEach(item => {
            this.workplaceCapacities.build = this.workplaceCapacities.build +
                item.workers ||
                item.workers;
        });

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

    handleServerTick(tick) {
        this.setCapacities();
        this.balanceWorkAllocation();
        this.resources.wood = this.getWood(tick);
        let population = this.getPopulation(tick);
        let food = this.getFood(tick, population);
        ({ food, population } = this.eatFood(food, population, tick));
        this.resources.food = food;
        this.population = population;
        this.updateBuildingQueue(tick);
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
        let food = this.resources.food +
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
        let wood = this.resources.wood +
            this.workAllocation.gather *
            this.woodGatherRate *
            deltaTimeSeconds;
        if (wood > this.resourceCapacities.wood) {
            this.pushLog('Not enough wood storage');
            wood = this.resourceCapacities.wood;
        }
        return wood;
    }

    startBuilding(buildingType) {
        const building = this.availableBuildings[buildingType];
        for (const resource in building.cost) {
            this.resources[resource] -= building.cost[resource];
        }
        const queueItem = {
            'buildingType': buildingType,
            'workers': building.construction.workers,
            'timeCost': building.construction.timeCost,
            'progress': 0,
        };
        this.buildingQueue.push(queueItem);
        this.setCapacities();
    }

    updateBuildingQueue(tick) {
        const totalBuildWorkers = this.workAllocation.build || 0;
        this.buildingQueue.forEach(item => {
            const buildWorkers = Math.min(item.workers, totalBuildWorkers);
            item.progress += tick * buildWorkers /
                (item.timeCost * item.workers);
            console.log(item.buildingType, item.progress)
            if (item.progress >= 1) {
                this.buildings[item.buildingType] = this.buildings[item.buildingType] + 1 || 1;
                this.buildingQueue.splice(this.buildingQueue.indexOf(item), 1);
                this.setCapacities();
            }
        });
    }

    getColonyStatsHtml() {
        const html = `
            <div>Population: ${Math.floor(this.population)} / ${this.housingCapacities.people}</div>
            <div>Food: ${Math.floor(this.resources.food)} / ${this.resourceCapacities.food}</div>
            <div>Wood: ${Math.floor(this.resources.wood)} / ${this.resourceCapacities.wood}</div>
            <br/>`;
        return html;
    }

    getWorkAllocationHtml() {
        const workAllocation = this.workAllocation;
        const totalWorkAllocation = this.getTotalWorkAllocation(this.workAllocation);
        const population = Math.floor(this.population);
        const autoAssignCheck = this.useAutoAssign ? 'checked' : '';
        let html = `
            <div><br/>
                <b>WORK</b>
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

    /*
        availableBuildings: {
        'housing': {
            label: 'Housing',
            buildingType: 'housing',
            cost: { 'wood': 100 },
            construction: { 'workers': 50 , 'timeCost': 30},
            capacity: 1000,
            unit: 'people'
        },
     */

    getBuildHtml() {
        let html = `<div id="lower-console-colony-build">`;

        html += `<div><b>SHIPYARD</b></div>`;
        html += '<table>';
        html += this.getShipyardHeader();
        html += this.getShipyardRows();
        html += '</table>';


        html += `<div><b>ORBITAL STRUCTURE</b></div>`;


        html += '<div><b>GROUND STRUCTURE</b></div>';
        html += '<table>';
        html += this.getGroundStructureHeader();
        html += this.getGroundStructureRows();
        html += '</table>';

        html += '</div>';
        return html;
    }

    isBuildDisabled(type) {
        const cost = this.availableBuildings[type].cost;
        for (const resource in cost) {
            if (this.resources[resource] < cost[resource]) {
                return 'disabled';
            }
        }
    }

    getGroundStructureHeader() {
        return `
            <tr>
                <th></th>
                <th>Building</th>
                <th>Cost</th>
                <th>Workers</th>
                <th>Time</th>
            </tr>
        `;
    }

    getShipyardHeader() {
        return `
            <tr>
                <th></th>
                <th>Type</th>
                <th>Cost</th>
                <th>Workers</th>
                <th>Time</th>
            </tr>
        `;
    }

    getShipyardRows() {
        return Object.entries(this.availableShips).map(([type, value]) => {
            const costHtml = Object.entries(value.cost).map(([resource, amount]) => {
                return `<span>${resource}: ${amount}</span>`
            }).join('');

            const disabled = false;

            var shipSpec = JSON.stringify(this.availableShips[type]['spec']).replaceAll("\n", "").replaceAll(" ", "").replaceAll('"', '~');

            console.log('shipSpec ', shipSpec);
            return (`
                <tr>
                    <td>
                        <button id="build-${type}"
                                onclick="handleBuildShipButton('${shipSpec}')"
                                ${disabled}>+</button>
                    </td>
                    <td>${value.label}</td>
                    <td>${costHtml}</td>
                    <td>${value.construction.workers}</td>
                    <td>${value.construction.timeCost}</td>
                </tr>
            `);
        }).join('');
    }

    getGroundStructureRows() {
        const groundStructureRows = Object.entries(this.availableBuildings).map(([type, value]) => {
            const label = value.label;
            const costHtml = Object.entries(value.cost).map(([resource, amount]) => {
                return `<span>${resource}: ${amount}</span>`
            }).join('');
            const disabled = this.isBuildDisabled(type);

            return (`
                <tr>
                    <td>
                        <button id="build-${type}"
                                onclick="handleBuildButton('${type}')"
                                ${disabled}>+</button>
                    </td>
                    <td>${label}</td>
                    <td>${costHtml}</td>
                    <td>${value.construction.workers}</td>
                    <td>${value.construction.timeCost}</td>
                </tr>
            `);
        });

        return groundStructureRows.join('')
    }

    getBuildingStatsHtml() {
        const colonyBuildings = Object.entries(this.buildings).map(([type, count]) => {
            return `<span>${this.availableBuildings[type].label}: ${count}</span>`;
        }).join('<br/>');
        const queuedBuildings = this.buildingQueue.map(item => {
            const building = this.availableBuildings[item.buildingType];
            const label = building.label;
            const progress = Math.floor(item.progress * 100);
            return `<span>${label} ${progress}%</span>`;
        }).join('<br/>');

        const html = `<div id="lower-console-building-stats"><table>
            <tr>
                <th>
                    BUILDINGS
                </th>
                <th>
                    QUEUED BUILDINGS
                </th>
            </tr>
            <tr>
                <td>
                    ${colonyBuildings}
                </td>
                <td>
                    ${queuedBuildings}
                </td>
            </tr>
            </table></div>`;
        return html;
    }

    pushLog(message) {
        // only log your own messages
        if (!this.playerId == 1) return;

        const existingLog = this.logs.find(log => log.message == message);
        const existingNewLog = this.newLogs.find(log => log == message);
        if (!existingLog) {
            this.logs.push({ message: message, timestamp: this.time });
            if (!existingNewLog) {
                this.newLogs.push(this.planetId + ' - ' + message);
            }
        } else if (existingLog?.timestamp < this.time - 60) {
            existingLog.timestamp = this.time;
            if (!existingNewLog) {
                this.newLogs.push(this.planetId + ' - ' + message);
            }
        }
    }

}

const defaulColonyConfig = {
    startingPopulation: 1000,
    startingResources: { food: 1000, wood: 1000, metal: 0 },
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
    availableShips: {
        'spyShip': {
            label: 'Spy Ship',
            spec: {
                make: 'GalacticLeopard',
                model: '6',
                size: 0.00015,
            },
            cost: { 'metal': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
        },
        'colonyShip': {
            label: 'Colony Ship',
            spec: {
                make: 'GalacticLeopard',
                model: '6',
                size: 0.00015,
            },
            cost: { 'metal': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
        },
        'destroyer': {
            label: 'Destroyer',
            spec: {
                make: 'GalacticLeopard',
                model: '6',
                size: 0.00015,
            },
            cost: { 'metal': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
        },
        'cruiserTank': {
            label: 'Cruiser Tank',
            spec: {
                make: 'GalacticLeopard',
                model: '6',
                size: 0.00015,
            },
            cost: { 'metal': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
        },
        'artilaryShip': {
            label: 'Artilary Ship',
            spec: {
                make: 'GalacticLeopard',
                model: '6',
                size: 0.00015,
            },
            cost: { 'metal': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
        },
        'carrier': {
            label: 'Carrier',
            spec: {
                make: 'GalacticLeopard',
                model: '6',
                size: 0.00015,
            },
            cost: { 'metal': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
        },

    },
    availableBuildings: {
        'housing': {
            label: 'Housing',
            buildingType: 'housing',
            cost: { 'wood': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
            capacity: 1000,
            unit: 'people'
        },
        'farm': {
            label: 'Farm',
            buildingType: 'workplace',
            cost: { 'wood': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
            capacity: 500,
            unit: 'farm'
        },
        'mine': {
            label: 'Mine',
            buildingType: 'workplace',
            cost: { 'wood': 100 },
            construction: { 'workers': 100, 'timeCost': 60 },
            capacity: 500,
            unit: 'mine'
        },
        'college': {
            label: 'College',
            buildingType: 'workplace',
            cost: { 'wood': 100 },
            construction: { 'workers': 200, 'timeCost': 120 },
            capacity: 50,
            unit: 'research'
        },
        'foodStorage': {
            label: 'Food Storage',
            buildingType: 'storage',
            cost: { 'wood': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
            capacity: 1000,
            unit: 'food'
        },
        'woodStorage': {
            label: 'Wood Storage',
            buildingType: 'storage',
            cost: { 'wood': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
            capacity: 1000,
            unit: 'wood'
        },
        'metalStorage': {
            label: 'Metal Storage',
            buildingType: 'storage',
            cost: { 'wood': 100 },
            construction: { 'workers': 50, 'timeCost': 30 },
            capacity: 1000,
            unit: 'metal'
        },
    }
}
