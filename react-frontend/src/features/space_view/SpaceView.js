import React from 'react';
import { useEffect, useRef, useContext } from 'react';
import {GameDataContext} from "../../app/Context";
import { useHistory } from 'react-router-dom';

const SpaceView = () => {
    const history = useHistory();
    let ref = useRef();
    const data = useContext(GameDataContext);

    useEffect(() => {
        let spaceViewWidget = data.spaceViewWidget;
        let canvas = ref.current;

        // const systemClickHandler = (path) => {
        //     if (history.location.pathname != path)
        //         history.push(path);
        // }

        // spaceViewWidget.beginGame(canvas, systemClickHandler);

        let requestId;
        const render = () => {
            // spaceViewWidget.draw();
            requestId = requestAnimationFrame(render);
        }
        render();

        return () => {
            cancelAnimationFrame(requestId);
        }
    });


    return (
        <div
            ref={ref}
            id="canvas-div"
            style={{ border: 'solid' }}
        />
    );
}

export default SpaceView;
