/* eslint-disable */
import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import Context from '../src/app/Context';
import { BrowserRouter as Router } from "react-router-dom";
import { createMyContext } from "../src/app/UserContext";


const userContext = createMyContext();
userContext.login = () => {};
userContext.logout = () => {};
userContext.initApp = () => {};


// TODO: create a mocked out userContext here, where login is stubbed
function render(ui, { rootReducer, ...renderOptions } = {}) {
  const store = configureStore({ reducer: rootReducer });

  function Wrapper({ children }) {
    return (
    <Provider store={store}>
        <Router>
          <Context userContext={userContext}>
            {children}
          </Context>
        </Router>
      </Provider>
    );

  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { render };
