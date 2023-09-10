import React from 'react';
import { useEffect, useRef, useContext } from 'react';
import {GameDataContext} from '../../app/Context';
import { useHistory } from 'react-router-dom';

const SpaceView = () => {
  const history = useHistory();
  let ref = useRef();
  const data = useContext(GameDataContext);
  let spaceViewWidget = data.spaceViewWidget;
  let requestId;

  const systemClickHandler = (path) => {
    history.push(path);
  };

  useEffect(() => {
    let canvas = ref.current;

    (async() => {
      let pathname = window.location.pathname;
      const hashString = window.location.hash;

      if (hashString.includes("#/systems")) {
        pathname = hashString.replace("#/", "/");
      }

      const systemIndex = parseInt(pathname.replace('/systems/', ''));
      await spaceViewWidget.beginGame(systemIndex, systemClickHandler);
      const render = () => {
        spaceViewWidget.draw();
        requestId = requestAnimationFrame(render);
      };
      render();
    })();

    return () => {
      cancelAnimationFrame(requestId);
      spaceViewWidget.detachFromDom();
    };
  });


  return (
    <div
      ref={ref}
      id="canvas-div"
      style={{ border: 'solid' }}
    />
  );
};

export default SpaceView;
