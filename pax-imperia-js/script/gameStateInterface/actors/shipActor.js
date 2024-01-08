import { GameStateInterface } from '../gameStateInterface.js';
import { Actor } from './actor.js';
import { Colony } from '../../widgets/space_view/entities/colony.js';

export class ShipActor extends Actor {

    /**
     *
     * @param {GameStateInterface} gameStateInterface
     */
    constructor(gameStateInterface) {
        super(gameStateInterface);
    }

    handle(action) {
        console.log('shipActor handling action', action)
        switch (action.verb) {
            case "move":
                this.move(action);
                break;
            case "jump":
                this.jump(action);
                break;
            case "discover":
                this.discover(action);
                break;
            case "orbit":
                this.orbit(action);
                break;
            case "colonize":
                this.colonize(action);
                break;
            case "attack":
                this.attack(action);
                break;
            case "dismiss":
                this.dismiss(action);
                break;
        }
    }

    /**
    * action.subject.type = "ship"
    * action.subject.id = shipId
    * action.subject.playerId = 1
    * action.verb = "discover"
    * action.object.type = "wormhole"
    * action.object.id = wormholeId
    */
    async discover(action) {
        const galaxy = this.gameStateInterface.galaxy;
        const wormhole = galaxy.getEntity('wormhole', action.object.id);

        // make wormhole name visible in originating system
        const connectedSystem = galaxy.getSystem(wormhole.toId);
        wormhole.name = connectedSystem.name;
        this.gameStateInterface.addEventLogEntry(
            `New system discovered - ${connectedSystem.name}`
        );

        // make wormhole name visible in destination system
        const connectedWormhole = connectedSystem.wormholes.find(
            x => x.toId.toString() === wormhole.systemId.toString()
        );
        connectedWormhole.name = galaxy.getSystem(wormhole.systemId).name;

        // add wormhole connection to player's list of connections
        const connection = [wormhole.systemId, wormhole.toId].sort();
        this.gameStateInterface.knownConnections.push(connection);

        // if player is in system with this wormhole, redraw wormhole text
        const spaceViewWidget = this.gameStateInterface.spaceViewWidget;
        const currentSystemId = spaceViewWidget.system.id;
        if (currentSystemId === wormhole.systemId) {
            await spaceViewWidget.spaceViewAnimator.redrawWormholeText(wormhole);
            spaceViewWidget.spaceViewDomManager.populateHtml();
        }
    }

    /**
    * action.subject.type = "ship"
    * action.subject.id = shipId
    * action.subject.player = "player1"
    * action.verb = "colonize"
    * action.object.type = "planet"
    * action.object.id = planetId
    */
    colonize(action) {
        const planet = this.gameStateInterface.galaxy.getEntity('planet', action.object.id);
        if (planet.colony) {
            console.log('already colonized');
            return;
        }
        planet.colony = new Colony({
            nextColonyId: this.gameStateInterface.galaxy.nextColonyId,
            playerId: action.subject.playerId,
            planetId: planet.id,
            startTime: this.gameStateInterface.gameClock.elapsedTime
        });

        // TODO: Float this method up
        // if player is currently in the system with the colonized planet
        if (this.gameStateInterface.spaceViewWidget.system.id === planet.systemId) {
            this.gameStateInterface.spaceViewWidget.spaceViewAnimator.addOutline(planet);
            // select planet
            const spaceViewDomManager = this.gameStateInterface.spaceViewWidget?.spaceViewDomManager;
            if (spaceViewDomManager && !spaceViewDomManager.selectionSprite.selectionTarget) {
                spaceViewDomManager.selectTarget(planet.object3d);
            }
        }
        this.gameStateInterface.addEventLogEntry(`New colony established on ${planet.name}`);
    }

}
