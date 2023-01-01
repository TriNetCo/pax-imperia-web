import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';
import { SpaceViewWidget } from 'pax-imperia-js/script/widgets/space_view/spaceViewWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';
import { Galaxy } from 'pax-imperia-js/script/models/galaxy';

const initGameData = () => {
  //////////
  // Main //
  //////////

  let gameData = {
    galaxy: new Galaxy(GameSettings.galaxyWidget)
  };

  let systemData = JSON.parse(gameData.galaxy.systems[0].toJson());

  const data = {
    galaxyWidget :
      new GalaxyWidget(GameSettings.galaxyWidget, gameData),
    spaceViewWidget:
      new SpaceViewWidget(GameSettings.spaceViewWidget, {}, systemData)
  };
  return data;
}

export { initGameData };
