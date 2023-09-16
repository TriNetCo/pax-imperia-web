import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';
import { SpaceViewWidget } from 'pax-imperia-js/script/widgets/space_view/spaceViewWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';
import { Galaxy } from 'pax-imperia-js/script/models/galaxy';

const initGameData = () => {
  //////////
  // Main //
  //////////

  let galaxy = new Galaxy(GameSettings.galaxyWidget);

  const data = {
    galaxyWidget:
      new GalaxyWidget(GameSettings.galaxyWidget, galaxy),
    spaceViewWidget:
      new SpaceViewWidget(GameSettings.spaceViewWidget, {}, galaxy)
  };
  return data;
};

export { initGameData };
