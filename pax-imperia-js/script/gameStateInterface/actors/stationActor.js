import {Actor} from './actor.js';
export class StationActor extends Actor {

    constructor(websocket) {
        super(websocket);
    }

    handle(action) {
        switch(action.verb) {
            case "create":
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
