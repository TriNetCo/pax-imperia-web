import { GameSettings } from '../../gameSettings';
import { Galaxy } from '../../models/galaxy';
import { GalaxyWidget } from './galaxyWidget';

const galaxyWidgetConfig = GameSettings.galaxyWidget;
galaxyWidgetConfig.systemCount = 3;

test('galaxyWidget can serialize the systemsData to JSON and deserialize from JSON', () => {
    Galaxy.seedRandomness('Axc2IJCs;s');
    const galaxy = Galaxy.generateFromConfig(galaxyWidgetConfig);

    let galaxyWidget = new GalaxyWidget(galaxyWidgetConfig, galaxy, {});

    const serializedData = galaxyWidget.exportGalaxyDataToJson();

    // Serialize the Galaxy to JSON
    const firstSystemOriginal = JSON.parse(serializedData)[0];

    // It's ok to change this if you've made a change you know will impact how
    // the galaxy is serialized (e.g. adding new properties)
    expect(serializedData.length).toBe(3095);

    // reset the galaxyWidget and Import the JSON again
    galaxyWidget = new GalaxyWidget();
    galaxyWidget.importGalaxyData(serializedData);

    // Test that the first system has all the stuff we expect
    const _galaxy = galaxyWidget.galaxy;
    expect(_galaxy.systems.length).toBe(3);

    const system = galaxyWidget.galaxy.systems[0];
    expect(system.name).toBe(firstSystemOriginal.name);
    expect(system.wormholes.length).toBe(1);
    expect(system.planets.length).toBe(4);
    expect(system.ships.length).toBe(3);

});
