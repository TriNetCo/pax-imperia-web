import { GalaxyDrawer } from './galaxyDrawer';
import { GameSettings } from '../../gameSettings';
import { Galaxy } from '../../models/galaxy'

// Variables
const c = Object.assign({}, GameSettings.galaxyWidget);
c.systemCount = 3;

const galaxy = Galaxy.generateFromConfig(c);

// create mocks
const mockCx = {
    canvas: {
        width: 20,
        height: 20,
    },
    fillRect(a, b, c, d) { }
};

const mockMouse = {}; // new THREE.Vector2(0,0);

test('galaxyDrawer can call drawBackground', () => {
    const galaxyDrawer = new GalaxyDrawer({
        cx: mockCx,
        galaxy: galaxy,
        mouse: mockMouse,
        systemRadius: 5,
    });

    galaxyDrawer.drawBackground();
});
