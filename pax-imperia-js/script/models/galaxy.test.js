import { Galaxy } from './galaxy';

import { GameSettings } from '../gameSettings';

test('it works', () => {
    // We need to copy the config object to modify it in our tests
    const c = Object.assign({}, GameSettings.galaxyWidget);
    const galaxy = new Galaxy(c);

    expect(galaxy.systems.length).toBe(100);
});
