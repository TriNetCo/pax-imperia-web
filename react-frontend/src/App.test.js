import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import GameDataContextProvider from './app/Context';
import { UserContextProvider } from './app/UserContextProvider';
import FirebaseConnector from './app/FirebaseConnector';

const azureAuth = {
    initLoginContext: async () => { },
};

test('renders learn react link', () => {
    const { getByText } = render(
        <Provider store={store}>
            <UserContextProvider azureAuth={azureAuth}>
                <Router>
                    <App />
                </Router>
            </UserContextProvider>
        </Provider>
    );

    expect(getByText(/Pax Imperia/i)).toBeInTheDocument();
});
