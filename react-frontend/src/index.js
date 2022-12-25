import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from "react-router-dom";
import { wsConnect, wsDisconnect } from './modules/websocket';

import './index.css';
import 'pax-imperia-js/css/style.css';
import 'pax-imperia-js/css/systems.css';
import Context from './app/Context';

const container = document.getElementById('root');
const root = createRoot(container);


const connectAndJoin = () => {
    // const { id, dispatch } = this.props;
    const id = 1;
    const dispatch = store.dispatch;
    const host = `ws://127.0.0.1:3001/ws/game/${id}?token=${localStorage.getItem('token')}`;
    dispatch(wsConnect(host));
};

connectAndJoin();

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <Router basename={process.env.REACT_APP_PUBLIC_SUFIX}>
            <Context>
                <App />
            </Context>
            {/* <GameDataContext.Provider value={data}>
            </GameDataContext.Provider> */}
        </Router>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// export {GameDataContext};