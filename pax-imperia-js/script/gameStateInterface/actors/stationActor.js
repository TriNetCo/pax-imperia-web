import {Actor} from './actor.js';
export class StationActor extends Actor {

    constructor(gameStateInterface) {
        super(gameStateInterface);
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
