import { GameStateInterface } from "../gameStateInterface.js";

export class Actor {

    /** @type {WebSocket} */
    websocket;
    /** @type {GameStateInterface} */
    gameStateInterface;

    constructor(websocket, gameStateInterface) {
        this.websocket = websocket;
        this.gameStateInterface = gameStateInterface;
    }
}
