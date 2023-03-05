import { render, fireEvent, screen } from "../../../tools/test-utils"; // We're using our own custom render function and not RTL's render our custom utils also re-export everything from RTL so we can import fireEvent and screen here as well
import "@testing-library/jest-dom/extend-expect";

import LoginPage from "./LoginPage";
import { websocketReducer } from "../../modules/websocket";
import { clearLocalStorage, spoofSignIn } from "../DebugPage/webToolHelpers"
const rootReducer = { websocket: websocketReducer };

describe("LoginPage tests", () => {

  beforeEach(() => {
    clearLocalStorage();
  })

  test("renders LoginPage when no localStorage is set", () => {
    const { getByText, getByTestId } = render(<LoginPage />, {
      rootReducer: rootReducer,
    });

    expect(getByText("Logged Out"))
    expect(getByText("Sign in using Redirect"))
  });

  test("renders LoginPage with localStorage data", () => {
    spoofSignIn();

    const { getByText, getByTestId } = render(<LoginPage />, {
      rootReducer: rootReducer,
    });

    expect(getByText("Logged In"))
    expect(getByText("username: " + localStorage.getItem('displayName')))
    expect(getByText("Sign out"))
  });

  test("I can go from logged out to logged in and back with the power of userContext", () => {
    const { container, getByText, getByRole } = render(<LoginPage />, {
      rootReducer: rootReducer,
    });

    expect(getByText("Logged Out"))

    const log_in_button = getByText(/change to logged_in/i)
    const pending_button = getByText(/change to pending/i)
    const log_out_button = getByText(/change to logged_out/i)


    fireEvent.click(log_in_button)
    expect(getByText("Logged In"))

    fireEvent.click(pending_button)
    expect(getByText("Login Pending"))

    fireEvent.click(log_out_button)
    expect(getByText("Logged Out"))
  });

});

