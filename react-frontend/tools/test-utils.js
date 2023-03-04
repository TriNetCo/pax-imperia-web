/* eslint-disable */
import React, { useContext } from "react";
import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import Context from '../src/app/Context';
import { BrowserRouter as Router } from "react-router-dom";
import UserContext, { createUserContext } from "../src/app/UserContext";
import AzureAuth from '../src/app/AzureAuth';


function render(ui, { rootReducer, storage, ...renderOptions } = {}) {
  const store = configureStore({ reducer: rootReducer });

  function Wrapper({ children }) {
    const otherUserContext = useContext(UserContext);
    const userContext = useContext(UserContext);
    // const userContext = createUserContext({storage, azureAuth: new AzureAuth()});

    userContext.login = () => {};
    userContext.logout = () => {};

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
