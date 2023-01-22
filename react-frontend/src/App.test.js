import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { BrowserRouter as Router } from "react-router-dom";

test('renders learn react link', () => {
  const { getByText } = render(
    <Router>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  );

  expect(getByText(/Pax Imperia/i)).toBeInTheDocument();
});
