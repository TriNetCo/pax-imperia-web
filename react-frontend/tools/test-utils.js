/* eslint-disable */
import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import Context from '../src/app/Context';
import { BrowserRouter as Router } from "react-router-dom";
import { createUserContext } from "../src/app/UserContext";
import AzureAuth from '../src/app/AzureAuth';


function render(ui, { rootReducer, storage, ...renderOptions } = {}) {
  const store = configureStore({ reducer: rootReducer });

  function Wrapper({ children }) {
    const userContext = createUserContext({storage, azureAuth: new AzureAuth()});

    userContext.login = () => {};
    userContext.logout = () => {};
    userContext.initApp = () => {};

    return (
      <Provider store={store}>
        <Context userContext={userContext}>
          <Router>
            {children}
          </Router>
        </Context>
      </Provider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { render };
