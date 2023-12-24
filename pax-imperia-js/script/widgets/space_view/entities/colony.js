import { capitalizeFirstLetter, roundToDecimal } from "../../../models/helpers.js";

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
        this.buildingQueue = params?.buildingQueue || [];
        this.workAllocation = params?.workAllocation || defaulColonyConfig?.workAllocation || {};

        const colonyConfig = params.colonyConfig;
        this.growthRate = colonyConfig?.growthRate || defaulColonyConfig.growthRate;
        this.foodConsumptionRate = colonyConfig?.foodConsumptionRate || defaulColonyConfig.foodConsumptionRate;
        this.foodProductionRate = colonyConfig?.foodProductionRate || defaulColonyConfig.foodProductionRate;
        this.buildRate = colonyConfig?.buildRate || defaulColonyConfig.buildRate;
        this.availableShips = colonyConfig?.availableShips || defaulColonyConfig.availableShips;
        this.defaultOrderOfWork = ['build', 'farm', 'mine', 'research'];
        this.orderOfWork = this.defaultOrderOfWork;
        this.logs = [];
        this.newLogs = [];
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
        let population = this.getPopulation(tick);
        let food = this.getFood(tick, population);
        ({ food, population } = this.eatFood(food, population, tick));
        this.resources.food = food;
        this.population = population;
        this.updateBuildingQueue(tick);
    }

    getPopulation(deltaTimeSeconds) {
        const population = (1 + this.growthRate * deltaTimeSeconds)
            * this.population;
        return population;
    }

    getFood(deltaTimeSeconds) {
        const food = (this.workAllocation.farm || 0)
            * this.population
            * this.foodProductionRate
            * deltaTimeSeconds
            + this.resources.food;
        return food;
    }

    eatFood(food, population, deltaTimeSeconds) {
        const foodEaten = this.foodConsumptionRate * deltaTimeSeconds * population;
        if (food < foodEaten) {
            let deaths = (food / foodEaten)
                * population
                * deltaTimeSeconds;
            this.pushLog('Not enough food');
            console.log('Not enough food', deaths);
            food = 0;
            population -= deaths;
        } else {
            food -= foodEaten;
        }
        return { food, population };
    }

    startBuilding(buildingType) {
        const building = this.this.availableShips[buildingType];
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
    }

    updateBuildingQueue(tick) {
        const totalBuildWorkers = Math.floor(this.population * this.workAllocation.build) || 0;
        this.buildingQueue.forEach(item => {
            const buildWorkers = Math.min(item.workers, totalBuildWorkers);
            item.progress += tick * buildWorkers /
                (item.timeCost * item.workers);
            console.log(item.buildingType, item.progress)
            if (item.progress >= 1) {
                this.buildings[item.buildingType] = this.buildings[item.buildingType] + 1 || 1;
                this.buildingQueue.splice(this.buildingQueue.indexOf(item), 1);
            }
        });
    }

    getColonyStatsHtml() {
        let html = `<div>Population: ${Math.floor(this.population)}</div>`
        Object.entries(this.resources).forEach(([key, value]) => {
            html += `<div>${capitalizeFirstLetter(key)}: ${Math.floor(value)}</div>`;
        });
        html += `<br/>`;
        return html;
    }

    getWorkAllocationHtml() {
        const workAllocation = this.workAllocation;
        let html = `
            <div><br/>
                <b>WORK</b>
                <button id="assign" onclick="handleAssignButton()">Assign</button>
            </div>
            <table>`;
        for (let i = 0; i < this.orderOfWork.length; i++) {
            const work = this.orderOfWork[i];
            const label = capitalizeFirstLetter(work);
            const allocation = workAllocation[work] || 0;
            html += `
                    <tr>
                        <td style="text-align:left;">
                            ${label}
                        </td>
                        <td>
                            <input id="assign${work}" name="assign${work}" type="range" min="0" max="100" step="0.1" value="${allocation * 100}" oninput="handleWorkSlider(this.value, '${work}')"/>
                        </td>
                        <td width="45px" style="text-align:right;">
                            <span id="${work}value">${roundToDecimal(allocation * 100, 1)} %</span>
                        </td>
                    </tr>`
        }
        html += '</table>';
        return html;
    }

    getBuildHtml() {
        let html = `<div id="lower-console-colony-build">`;

        html += `<div><b>SHIPYARD</b></div>`;
        html += '<table>';
        html += this.getShipyardHeader();
        html += this.getShipyardRows();
        html += '</table>';

        html += `<div><b>ORBITAL STRUCTURE</b></div>`;

        html += '</div>';
        return html;
    }

    isBuildDisabled(type) {
        const cost = this.availableShips[type].cost;
        for (const resource in cost) {
            if (this.resources[resource] < cost[resource]) {
                return 'disabled';
            }
        }
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

            const disabled = this.isBuildDisabled(type);

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

    getBuildingStatsHtml() {
        const queuedBuildings = this.buildingQueue.map(item => {
            const building = this.availableBuildings[item.buildingType];
            const label = building.label;
            const progress = Math.floor(item.progress * 100);
            return `<span>${label} ${progress}%</span>`;
        }).join('<br/>');

        const html = `<div id="lower-console-building-stats"><table>
            <tr>
                <th>
                    BUILDING QUEUE
                </th>
            </tr>
            <tr>
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
    startingResources: { food: 1000, metal: 0, fuel: 0 },
    growthRate: 0.001, // per second
    foodConsumptionRate: 0.016, // per population per second
    foodProductionRate: 0.032, // per second
    woodGatherRate: 0.032, // per second
    buildRate: 0.01, // per second
    workAllocation: { 'farm': 0.5, 'mine': 0.5, 'build': 0, 'research': 0 },
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
}
