import React from 'react';
import { useEffect, useRef, useContext } from 'react';
import { DataContext } from "../../index";

const Galaxy = () => {
    let ref = useRef();
    const data = useContext(DataContext);

    useEffect(() => {
        let galaxyWidget = data.galaxyWidget;
        console.log("MOUNTING... " + galaxyWidget);
        let canvas = ref.current;

        galaxyWidget.beginGame(canvas);

        let requestId;
        const render = () => {
            galaxyWidget.draw();
            requestId = requestAnimationFrame(render);
        }
        render();

        return () => {
            cancelAnimationFrame(requestId);
        }
    });


    return (
        <canvas
            ref={ref}
            id="galaxy-canvas-large"
            style={{ border: 'solid' }}
        />
    );
};

export default Galaxy;