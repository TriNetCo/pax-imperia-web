import * as THREE from 'three';

import { ShipActor } from "./actors/shipActor.js";
import { PlanetActor } from "./actors/planetActor.js";
import { StationActor } from "./actors/stationActor.js";
import { PlayerActor } from "./actors/playerActor.js";
import { SpaceViewWidget } from '../widgets/space_view/spaceViewWidget.js';
import { Galaxy } from '../models/galaxy.js';

/**
 * Anything that mutates the game state is done through this singleton.
 * This is the only place where the game state is mutated.
 *
 * This class holds the game state, and mutates it through the various
 * methods it implements.  It also holds the game clock, which is used
 * to determine when to update the game state.
 *
 * It also establishes the connection to the server, and sends the
 * game state to the server so that other clients can be updated.
 *
 * This class contains an incomplete representation of the game state,
 * whereas the server contains the complete representation of the game
 * state which is a collection of all states from all clients. This is
 * done to prevent cheating by players using information about their
 * adversary's positions that they did not discover through legal,
 * in-game interactions.
 *
 */
export class GameStateInterface {

    /** @type {SpaceViewWidget} - the player's current spaceViewWidget */
    spaceViewWidget;
    /** @type {Galaxy} */
    galaxy;

    constructor(configs) {
        this.galaxy = configs.galaxy;
        this.websocket = configs.websocket;
        this.gameClock = new THREE.Clock(false);
        this.websocket.onmessage = this.onMessage;

        this.shipActor = new ShipActor(this.websocket, this);
        this.planetActor = new PlanetActor(this.websocket, this);
        this.stationActor = new StationActor(this.websocket, this);
        this.playerActor = new PlayerActor(this.websocket, this);

        this.knownConnections = [];
        this.eventLog = [];

        this.players = {
            0: { id: 0, name: "player1 (you)", color: null },
            1: { id: 1, name: "dr potato", color: 0xff0000 },
        };

    }

    startClock() {
        if (!this.gameClock.running) {
            this.gameClock.start();
        }
    }

    // this method is called when a message comes from the server
    onMessage(event) {
        console.log(event.data);
        const action = JSON.parse(event.data);
        if (action.subject && action.verb) {
            this.performAction(action);
            return;
        }
        console.log("Non-action message received from server, ignoring: " + event.data);
    }

    // this method is called when the user performs a network action
    sendAction(action) {
        this.websocket.send(action);
    }

    /**
     * This method is called when the user locally performs an action
     * that mutates the game state, or when the server sends an action
     * to this client which mutates the game state.
     *
     * @param {object} action - A JSON object representing the action to perform.
     *   The action must have the following properties:
     * @param {string} action.subject.type: the type of object that is performing the action
     * @param {string} action.subject.id: the id of the object that is performing the action
     * @param {string} action.verb: the action to perform
     * @param {string} [action.object]: the object that is being acted upon
     * @param {object} [action.params]: the parameters to the action
     */
    performAction(action) {
        switch (action.subject.type) {
            case "ship":
                this.shipActor.handle(action);
                break;
            case "planet":
                this.planetActor.handle(action);
                break;
            case "station":
                this.stationActor.handle(action);
                break;
            case "player":
                this.playerActor.handle(action);
                break;
        }
    }

    addEventLogEntry(entry) {
        this.eventLog.push({ time: this.gameClock.elapsedTime, entry: entry });
        const spaceViewDomManager = this.spaceViewWidget.spaceViewDomManager;
        if (spaceViewDomManager) {
            this.spaceViewWidget.spaceViewDomManager.updateEventLogHtml(this.eventLog);
            // don't update the console body if the user is currently
            // selecting a target since it may be disruptive
            // TODO: move event log to a different element?
            if (!spaceViewDomManager.selectionSprite.selectionTarget) {
                this.spaceViewWidget.spaceViewDomManager.populateConsoleBody();
            }
        }
    }

    addEventLogEntries(entries) {
        entries.forEach(entry => this.addEventLogEntry(entry));
    }

}
