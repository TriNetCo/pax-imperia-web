import React from 'react';
import { Route, Switch } from "react-router-dom";
import './App.css';
import HomePage from './pages/HomePage';
import DebugPage from './pages/DebugPage';
import Default from './pages/Default';
import SystemPage from './pages/SystemPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './features/users/UsersPage';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/systems" component={HomePage} />
        <Route exact path="/systems/:systemId" component={SystemPage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/debug" component={DebugPage} />
        <Route exact path="/users" component={UsersPage} />
        <Route exact path="/default" component={Default} />
      </Switch>
    </div>
  );
}

export default App;
