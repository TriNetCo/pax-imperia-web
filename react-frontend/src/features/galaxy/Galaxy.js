import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three' ;

import { GalaxyWidget } from 'pax-imperia-js/script/models/galaxyWidget';

const Galaxy = () => {
    let ref = useRef();

    useEffect(() => {
        console.log("Using Effect");
        let canvas = ref.current;
        const galaxyWidget = new GalaxyWidget(canvas);
        galaxyWidget.beginGame();

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
            width='800px'
            height='400px'
            style={{ border: 'solid' }}
        />
    );
};

export default Galaxy;