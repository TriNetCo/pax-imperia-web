import React from 'react';
import { render, fireEvent } from '../../../tools/test-utils'; // We're using our own custom render function and not RTL's render our custom utils also re-export everything from RTL so we can import fireEvent and screen here as well
import '@testing-library/jest-dom/extend-expect';

// Stuff being tested
import { websocketReducer } from '../../modules/websocket';
import ChatLobby from './ChatLobby';
const rootReducer = { websocket: websocketReducer };

describe("ChatLobby tests", () => {

  beforeEach(() => {
    console.debug = jest.fn()
  })

  test('clicking send on ChatLobby clears out the input box', () => {
    const { getByText, getByTestId } = render(<ChatLobby />, {
      rootReducer: rootReducer,
    });

    const input = getByTestId("msg-field")
    fireEvent.change(input, {target: {value: 'hello world'}})

    expect(input.value).toEqual('hello world')
    fireEvent.click(getByText("Send"));
    expect(input.value).toEqual('')
  });

});

