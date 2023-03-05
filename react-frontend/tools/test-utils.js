/* eslint-disable */
import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { UserContextProvider } from '../src/app/UserContextProvider';


function render(ui, { rootReducer, ...renderOptions } = {}) {
  const store = configureStore({ reducer: rootReducer });
  const azureAuthMock = {
    initApp: () => {},
    signInMicrosoft: () => {},
    signOutMicrosoft: () => {},
  }

  function Wrapper({ children }) {

    return (
      <Provider store={store}>
        <UserContextProvider azureAuth={azureAuthMock}>
          <Router>
            {children}
          </Router>
        </UserContextProvider>
      </Provider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { render };
