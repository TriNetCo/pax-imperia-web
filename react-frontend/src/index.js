import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';

import './index.css';
// TODO: This approach may be slightly glitchy due to some caching issues.  It may be better to just move these imports directly into the public/index.html so
// I never have to worry about babel over-processing these css files or messing up on caching
import 'pax-imperia-js/css/app.css';
import 'pax-imperia-js/css/style.css';
import 'pax-imperia-js/css/systems.css';
import GameDataContextProvider from './app/GameDataContextProvider';
import FirebaseConnector from './app/FirebaseConnector';
import AzureAuth from './app/AzureAuth';
import { UserContextProvider } from './app/UserContextProvider';
const container = document.getElementById('root');
const root = createRoot(container);

import AppConfig from './AppConfig';
import GameData from './app/game/GameData';

console.log(`Loaded version ${AppConfig.BUILD_VERSION}`);

const gameData = new GameData();
gameData.initNewGame();
gameData.gameStateInterface.startClock();

const azureAuth = new AzureAuth();

root.render(
    <Provider store={store}>
        <UserContextProvider azureAuth={azureAuth}>
            <GameDataContextProvider gameData={gameData}>
                <FirebaseConnector azureAuth={azureAuth}>
                    {/* <React.StrictMode> */}
                    <Router basename={process.env.REACT_APP_PUBLIC_SUFIX}>
                        <App />
                    </Router>
                    {/* </React.StrictMode> */}
                </FirebaseConnector>
            </GameDataContextProvider>
        </UserContextProvider>
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
