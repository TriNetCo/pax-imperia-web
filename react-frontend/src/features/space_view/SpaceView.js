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

  useEffect(() => {
    let canvas = ref.current;

    (async() => {
      await spaceViewWidget.beginGame(canvas);
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
