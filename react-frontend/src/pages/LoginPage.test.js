import React from "react";
import { render, fireEvent } from "../../tools/test-utils"; // We're using our own custom render function and not RTL's render our custom utils also re-export everything from RTL so we can import fireEvent and screen here as well
import "@testing-library/jest-dom/extend-expect";

import LoginPage from "./LoginPage";
import { websocketReducer } from "../modules/websocket";
const rootReducer = { websocket: websocketReducer };

test("renders LoginPage when no localStorage is set", () => {
  const { getByText, getByTestId } = render(<LoginPage />, {
    rootReducer: rootReducer,
  });

  expect(getByText("Logged Out"))
  expect(getByText("username: NONE"))
  expect(getByText("Sign in using Redirect"))

  // fireEvent.click(getByText("Sign in using Redirect"));
  // a mocked out userContext.login() should be called
  // expect(getByTestId("count-value")).toHaveTextContent("1");
});

test("renders LoginPage with localStorage data", () => {
  populateLocalStorageData();

  const { getByText, getByTestId } = render(<LoginPage />, {
    rootReducer: rootReducer,
  });

  expect(getByText("Logged In"));
  expect(getByText("username: " + localStorage.getItem('displayName')));
  expect(getByText("Sign out"))
});

function populateLocalStorageData() {
  const usr = {
    displayName: 'Its Me',
    email: 'me@example.com',
    photoURL: '',
  };

  const credential = {
    accessToken: 'mockAccessToken',
    idToken: 'mockIdToken',
  };

  localStorage.setItem("displayName", usr.displayName);
  localStorage.setItem("email", usr.email);
  localStorage.setItem("photoURL", usr.photoURL);
  localStorage.setItem("accessToken", credential.accessToken);
  localStorage.setItem("idToken", credential.idToken);
  localStorage.setItem('login_status', 'logged_in');
}
