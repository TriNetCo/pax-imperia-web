import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from "react-router-dom";

import { GalaxyWidget } from 'pax-imperia-js/script/models/galaxyWidget';
import { GameSettings } from 'pax-imperia-js/script/gameSettings';

import './index.css';
import 'pax-imperia-js/css/style.css';
import 'pax-imperia-js/css/systems.css';

const container = document.getElementById('root');
const root = createRoot(container);

let width = 800;
let height = 400;
let systemCount = 100;
let systemRadius = 5;
let systemBuffer = 30;
let canvasBuffer = 15;

const data = {
    galaxyWidget :
        new GalaxyWidget(GameSettings.galaxyWidget)
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