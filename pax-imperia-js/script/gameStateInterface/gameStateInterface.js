import * as THREE from 'three';

import { ShipActor } from "./actors/shipActor.js";
import { PlanetActor } from "./actors/planetActor.js";
import { StationActor } from "./actors/stationActor.js";
import { PlayerActor } from "./actors/playerActor.js";

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

    constructor(configs) {
        this.galaxy = configs.galaxy;
        this.websocket = configs.websocket;
        this.gameClock = new THREE.Clock();
        this.websocket.onmessage = this.onMessage;

        this.shipActor = new ShipActor(this.websocket);
        this.planetActor = new PlanetActor(this.websocket);
        this.stationActor = new StationActor(this.websocket);
        this.playerActor = new PlayerActor(this.websocket);
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
     * @param {string} action.subject: the type of object that is performing the action
     * @param {string} action.verb: the action to perform
     * @param {string} [action.object]: the object that is being acted upon
     * @param {object} [action.params]: the parameters to the action
     */
    performAction(action) {
        switch(action.subject) {
            case "ship":
                shipActor.handle(action);
                break;
            case "planet":
                planetActor.handle(action);
                break;
            case "station":
                stationActor.handle(action);
                break;
            case "player":
                playerActor.handle(action);
                break;
        }
    }

}
