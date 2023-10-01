import React from 'react';
import { useEffect, useRef, useContext } from 'react';
import {GameDataContext} from '../../app/Context';

const SpaceView = () => {
    const data = useContext(GameDataContext);
    let spaceViewWidget = data.spaceViewWidget;
    let requestId;

    const systemClickHandler = (path) => {
        const systemIndex = path.replace('/systems/', '');
        spaceViewWidget.changeSystem(systemIndex);
    };

    useEffect(() => {
        // console.log('React: SpaceView useEffect');

        (async() => {
            let pathname = window.location.pathname;
            const hashString = window.location.hash;

            if (hashString.includes('#/systems')) {
                pathname = hashString.replace('#/', '/');
            }

            const systemIndex = parseInt(pathname.replace('/systems/', ''));
            console.log('starting await of loadWidget');
            const startTime = Date.now();
            await spaceViewWidget.loadWidget(systemIndex, systemClickHandler);
            const deltaTime = Date.now() - startTime;
            console.log('finished awaiting loadWidget: ' + deltaTime + ' ms');
            const draw = () => {
                spaceViewWidget.draw();
                requestId = requestAnimationFrame(draw);
            };
            draw();
        })();

        return () => {
            cancelAnimationFrame(requestId);
            spaceViewWidget.detachFromDom();
        };
    });


    return (
        <div
            id="canvas-div"
            style={{ border: 'solid' }}
        />
    );
};

export default SpaceView;
