import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from "react-router-dom";

import { GalaxyWidget } from 'pax-imperia-js/script/widgets/galaxy/galaxyWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';
import { Galaxy } from 'pax-imperia-js/script/models/galaxy';

import './index.css';
import 'pax-imperia-js/css/style.css';
import 'pax-imperia-js/css/systems.css';

const container = document.getElementById('root');
const root = createRoot(container);

//////////
// Main //
//////////

let gameData = {
    galaxy: new Galaxy(GameSettings.galaxyWidget)
};

const data = {
    galaxyWidget :
        new GalaxyWidget(GameSettings.galaxyWidget, gameData)
};
const DataContext = React.createContext(data);

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <Router basename={process.env.REACT_APP_PUBLIC_SUFIX}>
            <DataContext.Provider value={data}>
                <App />
            </DataContext.Provider>
        </Router>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export {DataContext};