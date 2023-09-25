import { Actor } from "./actor.js";

export class PlanetActor extends Actor {

    constructor(websocket) {
        super(websocket);
    }

    handle(action) {
        switch(action.verb) {
            case "colonize":
                this.create(action);
                break;
            case "destroy":
                this.destroy(action);
                break;
            case "update":
                this.update(action);
                break;
        }
    }

}
