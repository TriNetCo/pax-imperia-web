import FirebaseConnector from "./FirebaseConnector";
import { createUserContext } from "./UserContext";

import {redirectSuccessHandler, redirectStuckHandler, alreadyLoggedInHandler, loginExpiredHandler} from './FirebaseConnector';
import AzureAuth from './AzureAuth';


describe("FirebaseConnector tests", () => {
  let userContext;
  const expectedAccessToken = 'mockAccessToken';
  const expectedDisplayName = 'Its Me';
  const expectedToken = 'sapletoken';

  const redirectResultSample = {
    user: {
      accessToken: expectedAccessToken,
      displayName: expectedDisplayName,
      email: 'me@example.com',
      photoURL: null,
      metadata: {
        lastSignInTime: 'Mon, 01 Jan 2023 01:00:00 GMT'
      }
    },
    credential: {
      accessToken: 'mockIdTokenFromProvider',
    }
  };

  beforeEach(() => {
    const azureAuth = new AzureAuth();
    azureAuth.signInMicrosoft = () => {};
    azureAuth.signOutMicrosoft = () => {};

    userContext = createUserContext({azureAuth});
  })

  test('redirectSuccessHandler will fillUserInfoFromRedirect', () => {
    const handlerUnderTest = redirectSuccessHandler(userContext)

    try {
      handlerUnderTest(redirectResultSample)
    } catch { }


    expect(userContext.displayName).toEqual(expectedDisplayName);
    expect(userContext.token).toEqual(expectedAccessToken);
  });

  test('redirectStuckHandler will set logged_out if appropriate', () => {
    userContext.loginStatus = 'pending';
    const handlerUnderTest = redirectStuckHandler(userContext)

    try {
      handlerUnderTest()
    } catch { }

    expect(userContext.loginStatus).toEqual('logged_out');
  });

  test('alreadyLoggedInHandler will set userContext.token', () => {
    const handlerUnderTest = alreadyLoggedInHandler(userContext)

    try {
      handlerUnderTest(expectedToken)
    } catch { }

    expect(userContext.token).toEqual(expectedToken);
  });

  test('loginExpiredHandler will logout the userContext', () => {
    userContext.loginStatus = 'logged_in';
    const handlerUnderTest = loginExpiredHandler(userContext)

    try {
      handlerUnderTest()
    } catch (error) { }

    expect(userContext.loginStatus).toEqual('logged_out');
  });

});
