import React from 'react';
import { useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { GameDataContext } from '../../app/GameDataContextProvider';
import { useHistory } from 'react-router-dom';
import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';

const Galaxy = ({canvasWidth, canvasHeight}) => {
    const history = useHistory();
    const ref = useRef();
    const { data } = useContext(GameDataContext);

    useEffect(() => {
        if (data === null) return; // for testing...

        /** @type {GalaxyWidget} */
        const galaxyWidget = data.galaxyWidget;
        const canvas = ref.current;

        const systemClickHandler = path => history.push(path);

        const overrideConfig = {
            'canvasWidth': canvasWidth,
            'canvasHeight': canvasHeight,
            'currentSystemId': data.spaceViewWidget?.system?.id,
        };
        galaxyWidget.loadWidget(canvas, systemClickHandler, overrideConfig);

        let requestId;
        const render = () => {
            galaxyWidget.draw();
            requestId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(requestId);
            galaxyWidget.detachFromDom();
            console.log('detached galaxy from dom');
        };
    });


    return (
        <canvas
            ref={ref}
            style={{ border: 'solid' }}
        />
    );
};

Galaxy.propTypes = {
    canvasWidth:  PropTypes.number,
    canvasHeight: PropTypes.number,
};

export default Galaxy;
