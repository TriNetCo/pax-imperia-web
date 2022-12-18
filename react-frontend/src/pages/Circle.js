import React from 'react';
import { useEffect, useRef } from 'react';

import * as THREE from 'three' ;

const getPixelRatio = context => {
    var backingStore =
        context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio ||
        1;

    return (window.devicePixelRatio || 1) / backingStore;
};

const Circle = () => {
    let ref = useRef();

    useEffect(() => {


        ///////////////////
        //  On Load Code //
        ///////////////////

        let canvas = ref.current;
        let context = canvas.getContext('2d');

        
        // CLOSURE
        let requestId,
            i = 0;
        const render = () => {

            ///////////////
            // Draw Loop //
            ///////////////
            context.fillStyle = "White";
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);

            context.fillStyle = "Black";
            context.beginPath();
            context.arc(
                canvas.width / 2, 
                canvas.height / 2, 
                (canvas.width / 2) * Math.abs(Math.sin(i)), 
                0, 2 * Math.PI);
            context.fill();

            console.log("Called i: " + (canvas.width / 2) * Math.abs(Math.cos(i)));




            // CLOSURE
            i += 0.05;
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
            width='100px'
            height='100px'
            style={{ border: 'solid' }}
        />
    );
};

export default Circle;