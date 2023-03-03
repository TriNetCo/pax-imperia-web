import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { BrowserRouter as Router } from "react-router-dom";
import {createUserContext} from './app/UserContext';
import Context from './app/Context';
import AzureAuth from './app/AzureAuth';


test('renders learn react link', () => {
  const { getByText } = render(
    <Provider store={store}>
      <Context userContext={createUserContext()}>
        <Router>
          <App />
        </Router>
      </Context>
    </Provider>
  );

  expect(getByText(/Pax Imperia/i)).toBeInTheDocument();
});
