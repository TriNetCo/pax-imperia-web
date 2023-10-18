import { Galaxy } from './galaxy';
import { GameSettings } from '../gameSettings';

const systemsJson = `[{"id":0,"name":"Achernar","position":{"x":593,"y":304,"z":2.61},"radius":5,"connections":[{"id":"0_2","fromId":0,"toId":2,"name":"Antares","toPosition":{"x":783,"y":78,"z":3.03}},{"id":"0_1","fromId":0,"toId":1,"name":"Sargas","toPosition":{"x":22,"y":254,"z":4.01}}],"stars":[{"index":0,"atmosphere":"sun","size":2.59,"distance_from_star":0,"spin_speed":0.9,"starting_angle":0}],"planets":[{"id":0,"number":0,"atmosphere":"earthlike0005","cloud_type":"clouds0005","size":1.05,"distance_from_star":4.47,"spin_speed":0.9,"starting_angle":0.06},{"id":1,"number":1,"atmosphere":"earthlike0007","cloud_type":"clouds0002","size":0.42,"distance_from_star":7.17,"spin_speed":0.9,"starting_angle":1.45},{"id":2,"number":2,"atmosphere":"earthlike0004","cloud_type":"clouds0007","size":0.84,"distance_from_star":9.7,"spin_speed":0.7,"starting_angle":0.78}],"ships":[{"name":"Galactic Potato 0","id":0,"playerId":1,"position":{"x":15.88,"y":-7.68,"z":8.78},"make":"GalacticLeopard","model":6,"size":0.00015},{"name":"Galactic Potato 1","id":1,"playerId":1,"position":{"x":-14.89,"y":7.77,"z":7.08},"make":"GalacticLeopard","model":6,"size":0.00015}]},{"id":1,"name":"Sargas","position":{"x":22,"y":254,"z":4.01},"radius":5,"connections":[{"id":"1_0","fromId":1,"toId":0,"name":"Achernar","toPosition":{"x":593,"y":304,"z":2.61}}],"stars":[{"index":0,"atmosphere":"sun","size":2.28,"distance_from_star":0,"spin_speed":1.5,"starting_angle":0}],"planets":[{"id":3,"number":0,"atmosphere":"earthlike0006","cloud_type":"clouds0005","size":0.58,"distance_from_star":3.94,"spin_speed":1.3,"starting_angle":0.47},{"id":4,"number":1,"atmosphere":"earthlike0002","cloud_type":"clouds0003","size":0.41,"distance_from_star":6.03,"spin_speed":1.5,"starting_angle":2.08},{"id":5,"number":2,"atmosphere":"earthlike0001","cloud_type":"clouds0003","size":0.44,"distance_from_star":7.78,"spin_speed":1.5,"starting_angle":0.04},{"id":6,"number":3,"atmosphere":"earthlike0008","cloud_type":"clouds0005","size":0.91,"distance_from_star":9.9,"spin_speed":1,"starting_angle":2.98}],"ships":[{"name":"Galactic Potato 2","id":2,"playerId":1,"position":{"x":8.3,"y":-6.06,"z":7.81},"make":"GalacticLeopard","model":6,"size":0.00015},{"name":"Galactic Potato 3","id":3,"playerId":1,"position":{"x":-10.68,"y":-5.42,"z":10.45},"make":"GalacticLeopard","model":6,"size":0.00015}]},{"id":2,"name":"Antares","position":{"x":783,"y":78,"z":3.03},"radius":5,"connections":[{"id":"2_0","fromId":2,"toId":0,"name":"Achernar","toPosition":{"x":593,"y":304,"z":2.61}}],"stars":[{"index":0,"atmosphere":"sun","size":3.34,"distance_from_star":0,"spin_speed":0.7,"starting_angle":0}],"planets":[{"id":7,"number":0,"atmosphere":"earthlike0008","cloud_type":"clouds0003","size":0.9,"distance_from_star":5.62,"spin_speed":0.8,"starting_angle":1.88},{"id":8,"number":1,"atmosphere":"earthlike0003","cloud_type":"clouds0005","size":0.93,"distance_from_star":8.29,"spin_speed":0.8,"starting_angle":1.48},{"id":9,"number":2,"atmosphere":"earthlike0008","cloud_type":"clouds0003","size":0.64,"distance_from_star":10.96,"spin_speed":1.1,"starting_angle":0.19},{"id":10,"number":3,"atmosphere":"earthlike0006","cloud_type":"clouds0001","size":0.9,"distance_from_star":13.7,"spin_speed":1.2,"starting_angle":0.64},{"id":11,"number":4,"atmosphere":"earthlike0007","cloud_type":"clouds0001","size":1.13,"distance_from_star":16.69,"spin_speed":0.7,"starting_angle":1.33}],"ships":[{"name":"Galactic Potato 4","id":4,"playerId":1,"position":{"x":-4.91,"y":7.82,"z":11.26},"make":"GalacticLeopard","model":6,"size":0.00015}]}]`;

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
