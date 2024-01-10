import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import GameDataContextProvider from './app/GameDataContextProvider';
import { UserContextProvider } from './app/UserContextProvider';

const azureAuth = {
    initLoginContext: async () => { },
};

const gameData = {
    injectReactGarbage: () => { },
};

test('renders learn react link', () => {
    const { getByText } = render(
        <Provider store={store}>
            <UserContextProvider azureAuth={azureAuth}>
                <GameDataContextProvider gameData={gameData}>
                    <Router>
                        <App />
                    </Router>
                </GameDataContextProvider>
            </UserContextProvider>
        </Provider>
    );

    expect(getByText(/Pax Imperia/i)).toBeInTheDocument();
});
