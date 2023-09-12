import { GalaxyDrawer } from './galaxyDrawer';
import { GameSettings } from '../../gameSettings';
import { Galaxy } from '../../models/galaxy';

// create mocks
const mockCx = {
    canvas: {
        width: 20,
        height: 20,
    },
    fillRect(a,b,c,d) {

    }

};
const mockSystemNameLabel = {}; // document.getElementById("system-name");
const mockMouse = {}; // new THREE.Vector2(0,0);

test('it works', () => {
    // We need to copy the config object to modify it in our tests
    const c = Object.assign({}, GameSettings.galaxyWidget);
    const galaxy = new Galaxy(c);

    expect(galaxy.systems.length).toBe(100);
});

test('galaxyDrawer can call drawBackground', () => {
    // We need to copy the config object to modify it in our tests
    const c = Object.assign({}, GameSettings.galaxyWidget);
    const galaxy = new Galaxy(c);
    const galaxyDrawer = new GalaxyDrawer({
        cx: mockCx,
        galaxy: galaxy,
        systemNameLabel: mockSystemNameLabel,
        mouse: mockMouse });


    galaxyDrawer.drawBackground();


});
