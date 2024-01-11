/* eslint-disable */
import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { UserContextProvider } from '../src/app/UserContextProvider';
import GameDataContextProvider from "src/app/GameDataContextProvider";
import socketMiddleware from "src/modules/socketMiddleware";


function render(ui, { rootReducer, ...renderOptions } = {}) {

    const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
    };

    const sendSpy = jest.spyOn(mockWebSocket, 'send');

    const websocketFactory = (host) => {
        return mockWebSocket;
    };

    const store = configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => {
            return getDefaultMiddleware().concat(socketMiddleware(websocketFactory))
        }
    });

    const azureAuthMock = {
        initApp: () => {},
        signInMicrosoft: () => {},
        signOutMicrosoft: () => {},
    }

    const gameData = {
        injectReactGarbage: () => { },
    };

    function Wrapper({ children }) {

        return (
        <Provider store={store}>
            <UserContextProvider azureAuth={azureAuthMock}>
                <GameDataContextProvider gameData={gameData}>
                    <Router>
                        {children}
                    </Router>
                </GameDataContextProvider>
            </UserContextProvider>
        </Provider>
        );
    }

    return {
        ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
        sendSpy,
        store
    };
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { render };
