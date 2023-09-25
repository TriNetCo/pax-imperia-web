import { Actor } from './actor.js';

export class ShipActor extends Actor {

    constructor(websocket) {
        super(websocket);
    }

    handle(action) {
        switch(action.verb) {
            case "move":
                this.move(action);
                break;
            case "jump":
                this.jump(action);
                break;
            case "orbit":
                this.orbit(action);
                break;
            case "attack":
                this.attack(action);
                break;
            case "dismiss":
                this.dismiss(action);
                break;
        }
    }

}
