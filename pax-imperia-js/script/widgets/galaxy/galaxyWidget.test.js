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

    expect(serializedData.length).toBe(3231);

    // reset the galaxyWidget and Import the JSON again
    galaxyWidget = new GalaxyWidget();
    galaxyWidget.importGalaxyData(serializedData);

    expect(galaxyWidget.galaxy.systems.length).toBe(3)
    expect(galaxyWidget.galaxy.systems[0].name).toBe(firstSystemOriginal.name);
});
