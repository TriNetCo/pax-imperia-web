import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';

import './index.css';
import 'pax-imperia-js/css/style.css';
import 'pax-imperia-js/css/systems.css';
import Context from './app/Context';
import { initGameData } from './app/gameDataInitializer';
import { createUserContext } from './app/UserContext';

const container = document.getElementById('root');
const root = createRoot(container);

const gameData    = initGameData();
const userContext = createUserContext();

root.render(
  <Provider store={store}>
    <Context gameData={gameData} userContext={userContext}>
      <React.StrictMode>
        <Router basename={process.env.REACT_APP_PUBLIC_SUFIX}>
          <App />
        </Router>
      </React.StrictMode>
    </Context>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
