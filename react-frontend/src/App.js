import React from 'react';
import { Route, Switch } from "react-router-dom";
import './App.css';
import HomePage from './pages/HomePage';
import Default from './pages/Default';
import SystemPage from './pages/SystemPage';

function App() {
    return (
        <div className="App">
            <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/systems" component={HomePage} />
                <Route exact path="/systems/:systemId" component={SystemPage} />
                <Route exact path="/default" component={Default} />
            </Switch>

        </div>
    );
}

export default App;
