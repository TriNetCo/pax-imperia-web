import React from 'react';
import { render, fireEvent } from '../../../tools/test-utils'; // We're using our own custom render function and not RTL's render our custom utils also re-export everything from RTL so we can import fireEvent and screen here as well
import '@testing-library/jest-dom/extend-expect';

// Stuff being tested
import DebugPage from './DebugPage';
import { websocketReducer } from '../../modules/websocket';
const rootReducer = { websocket: websocketReducer };

describe("DebugPage tests", () => {

  beforeEach(() => {
    console.debug = jest.fn()
  })

  test('renders DebugPage', () => {
    const { getByText, getByTestId } = render(<DebugPage />, {
      rootReducer: rootReducer,
    });

    expect(getByText('Login Status: logged_out'));
  });

});

