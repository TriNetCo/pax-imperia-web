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

    remove(type, id) {
        const galaxy = this.gameStateInterface.galaxy;
        const entity = galaxy.getEntity(type, id);

        galaxy.removeEntity(type, id);
        this.removeFromScene(entity);
    }

    removeFromScene(entity) {
        const spaceViewWidget = this.gameStateInterface?.spaceViewWidget;
        // if player is currently viewing the system that the entity is in
        if (entity.systemId === spaceViewWidget?.system?.id) {
            const scene = spaceViewWidget.spaceViewAnimator.scene;
            scene.remove(entity.object3d);
            spaceViewWidget.spaceViewDomManager.populateHtml();
        }
    }

}
