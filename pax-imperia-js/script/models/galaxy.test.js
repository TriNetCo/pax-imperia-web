import { Galaxy } from './galaxy';
import { GameSettings } from '../gameSettings';

const systemsJson = `[{"id":0,"name":"Lupus","position":{"x":261,"y":119,"z":-6.26},"radius":5,"connections":[{"id":"0_2","fromId":0,"toId":2,"name":"Vulpecula","toPosition":{"x":573,"y":185,"z":4.74}}],"stars":[{"index":0,"atmosphere":"sun","size":2.78,"distance_from_star":0,"spin_speed":1.3,"starting_angle":0}],"planets":[{"id":"0_0","number":0,"atmosphere":"earthlike0009","cloud_type":"clouds0006","size":0.97,"distance_from_star":4.81,"spin_speed":1.1,"starting_angle":1.26},{"id":"0_1","number":1,"atmosphere":"earthlike0007","cloud_type":"clouds0002","size":0.48,"distance_from_star":7.47,"spin_speed":1.2,"starting_angle":1.19},{"id":"0_2","number":2,"atmosphere":"earthlike0003","cloud_type":"clouds0005","size":0.87,"distance_from_star":9.57,"spin_speed":1,"starting_angle":2.78}],"ships":[{"name":"ship_GalacticLeopard6_0_0","id":"0_0","playerId":1,"position":{"x":-11.08,"y":-1.18,"z":5.48},"make":"GalacticLeopard","model":6,"size":0.00015},{"name":"ship_GalacticLeopard6_0_1","id":"0_1","playerId":2,"position":{"x":15.94,"y":2.56,"z":3.53},"make":"GalacticLeopard","model":6,"size":0.00015}]},{"id":1,"name":"Cassiopeia","position":{"x":722,"y":274,"z":-1.39},"radius":5,"connections":[{"id":"1_2","fromId":1,"toId":2,"name":"Vulpecula","toPosition":{"x":573,"y":185,"z":4.74}}],"stars":[{"index":0,"atmosphere":"sun","size":2.82,"distance_from_star":0,"spin_speed":0.5,"starting_angle":0}],"planets":[{"id":"1_0","number":0,"atmosphere":"earthlike0006","cloud_type":"clouds0009","size":0.84,"distance_from_star":4.54,"spin_speed":1.4,"starting_angle":2.88},{"id":"1_1","number":1,"atmosphere":"earthlike0002","cloud_type":"clouds0007","size":0.46,"distance_from_star":7.2,"spin_speed":1.2,"starting_angle":0.37},{"id":"1_2","number":2,"atmosphere":"earthlike0004","cloud_type":"clouds0008","size":0.9,"distance_from_star":9.87,"spin_speed":1.4,"starting_angle":3.07},{"id":"1_3","number":3,"atmosphere":"earthlike0004","cloud_type":"clouds0002","size":0.5,"distance_from_star":12.36,"spin_speed":0.7,"starting_angle":0.51}],"ships":[{"name":"ship_GalacticLeopard6_1_0","id":"1_0","playerId":1,"position":{"x":-9.13,"y":-5.28,"z":3.35},"make":"GalacticLeopard","model":6,"size":0.00015}]},{"id":2,"name":"Vulpecula","position":{"x":573,"y":185,"z":4.74},"radius":5,"connections":[{"id":"2_1","fromId":2,"toId":1,"name":"Cassiopeia","toPosition":{"x":722,"y":274,"z":-1.39}},{"id":"2_0","fromId":2,"toId":0,"name":"Lupus","toPosition":{"x":261,"y":119,"z":-6.26}}],"stars":[{"index":0,"atmosphere":"sun","size":2.03,"distance_from_star":0,"spin_speed":0.9,"starting_angle":0}],"planets":[{"id":"2_0","number":0,"atmosphere":"earthlike0007","cloud_type":"clouds0004","size":0.5,"distance_from_star":3.4,"spin_speed":1,"starting_angle":0.23},{"id":"2_1","number":1,"atmosphere":"earthlike0002","cloud_type":"clouds0008","size":0.45,"distance_from_star":5.24,"spin_speed":0.5,"starting_angle":0.18},{"id":"2_2","number":2,"atmosphere":"earthlike0004","cloud_type":"clouds0001","size":0.92,"distance_from_star":7.41,"spin_speed":1.5,"starting_angle":2.67},{"id":"2_3","number":3,"atmosphere":"earthlike0005","cloud_type":"clouds0002","size":0.58,"distance_from_star":9.82,"spin_speed":0.8,"starting_angle":3.08}],"ships":[{"name":"ship_GalacticLeopard6_2_0","id":"2_0","playerId":1,"position":{"x":-5.8,"y":-1.63,"z":5.65},"make":"GalacticLeopard","model":6,"size":0.00015},{"name":"ship_GalacticLeopard6_2_1","id":"2_1","playerId":2,"position":{"x":3.62,"y":7.06,"z":2.68},"make":"GalacticLeopard","model":6,"size":0.00015}]}]`;

test('it can generate a system from config', () => {
    // We need to copy the config object to modify it in our tests
    const c = Object.assign({}, GameSettings.galaxyWidget);
    c.systemCount = 3;
    const galaxy = Galaxy.generateFromConfig(c);

    // console.log(galaxy.toJson());

    expect(galaxy.systems.length).toBe(3);
});

test('Brittle Test: use Galaxy\'s createFromJson method to load systemsJson', () => {
    // NOTE: When this test breaks, it's probably because the json format has changed
    // update systemsJson by running the above test and outputting the json
    // so you can copy it into the systemsJson variable

    // We need to copy the config object to modify it in our tests
    const galaxy = Galaxy.initializeFromJson(systemsJson);

    expect(galaxy.systems.length).toBe(3);
});
