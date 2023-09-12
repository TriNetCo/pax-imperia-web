import { GameSettings } from '../../gameSettings';
import { Galaxy } from '../../models/galaxy';
import { GalaxyWidget } from './galaxyWidget';

const galaxyWidgetConfig = GameSettings.galaxyWidget;
const gameData = {
    galaxy: new Galaxy(GameSettings.galaxyWidget)
};

const systemsJson = `[{"id":0,"name":"Regor","position":{"x":417,"y":38,"z":2.78},"radius":5,"connections":[{"id":2,"name":"Vega","position":{"x":348,"y":175,"z":-3.86}}],"stars":[{"index":0,"atmosphere":"sun","size":2.89,"distance_from_star":0,"spin_speed":1,"starting_angle":0}],"planets":[{"index":0,"atmosphere":"oxygen","size":0.86,"distance_from_star":4.81,"spin_speed":1,"starting_angle":0.4},{"index":1,"atmosphere":"oxygen","size":0.54,"distance_from_star":7.63,"spin_speed":1,"starting_angle":0.44}],"ships":[{"name":"ship_0_0","index":0,"position":{"x":-8.15,"y":7.34,"z":9.4}},{"name":"ship_0_1","index":1,"position":{"x":-2.19,"y":-2.74,"z":9.35}}]},{"id":1,"name":"Vulpecula","position":{"x":126,"y":370,"z":7.41},"radius":5,"connections":[{"id":2,"name":"Vega","position":{"x":348,"y":175,"z":-3.86}}],"stars":[{"index":0,"atmosphere":"sun","size":2.41,"distance_from_star":0,"spin_speed":1,"starting_angle":0}],"planets":[{"index":0,"atmosphere":"oxygen","size":0.52,"distance_from_star":4.05,"spin_speed":1,"starting_angle":0.32},{"index":1,"atmosphere":"oxygen","size":0.87,"distance_from_star":6.89,"spin_speed":1,"starting_angle":1.49}],"ships":[{"name":"ship_1_0","index":0,"position":{"x":-0.93,"y":8.18,"z":2.5}},{"name":"ship_1_1","index":1,"position":{"x":3.22,"y":-3.12,"z":7.17}}]},{"id":2,"name":"Vega","position":{"x":348,"y":175,"z":-3.86},"radius":5,"connections":[{"id":0,"name":"Regor","position":{"x":417,"y":38,"z":2.78}},{"id":1,"name":"Vulpecula","position":{"x":126,"y":370,"z":7.41}}],"stars":[{"index":0,"atmosphere":"sun","size":1.96,"distance_from_star":0,"spin_speed":1,"starting_angle":0}],"planets":[{"index":0,"atmosphere":"oxygen","size":0.93,"distance_from_star":4.22,"spin_speed":1,"starting_angle":2.91},{"index":1,"atmosphere":"oxygen","size":1.13,"distance_from_star":7.39,"spin_speed":1,"starting_angle":0.52},{"index":2,"atmosphere":"oxygen","size":0.7,"distance_from_star":10.56,"spin_speed":1,"starting_angle":2.18}],"ships":[{"name":"ship_2_0","index":0,"position":{"x":2.75,"y":4.63,"z":5.53}},{"name":"ship_2_1","index":1,"position":{"x":1.73,"y":-5.19,"z":11.07}}]}]`

test('galaxyWidget can serialize the systemsData to JSON', () => {
    const galaxyWidget = new GalaxyWidget(galaxyWidgetConfig, gameData);

    const serializedData = galaxyWidget.exportGalaxyData();

    expect(serializedData.length > 80000).toBe(true); // TODO: change to just expect a string type
});

test('galaxyWidget can deserialize the systemsData to JSON', () => {
    const galaxyWidget = new GalaxyWidget(galaxyWidgetConfig, gameData);

    galaxyWidget.importGalaxyData(systemsJson);

    expect(galaxyWidget.galaxy.systems.length).toBe(3)
});
