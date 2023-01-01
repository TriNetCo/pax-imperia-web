import React, { useEffect, useContext } from 'react';
import { UserContext } from '../app/UserContext';

import {
  CircularProgress
} from '@mui/material';

import { catchRedirectSignInMicrosoft } from '../app/AzureAuth';


export default function LoginPage() {
  const userContext = useContext(UserContext);

  useEffect(() => {

    // If this is a glitched up render and userContext is still booting, then return early
    if (!userContext.initialized) return;

    // If this is a glitched up render and userContext is still booting, then return early
    // if (userContext.displayName === undefined)
    //   return;
    // If we're not expecting a redirect (ie "logged_in" or 'logged_out' is set) return early to reduce web traffic
    if (userContext.status !== 'pending')
      return;

    console.log("Calling catchRedirectSignInMicrosoft");
    catchRedirectSignInMicrosoft()
      .then(result => {
        if (result == null) {
          if (userContext.status === 'pending') {
            userContext.setStatus('logged_out');  // catches bugs where the login is set to pending, but no redirect comes in
          }
          return;  // sometimes this is null, even if it's a redirect response
        }

        userContext.fillUserInfoFromRedirect(result.user, result.credential);
      })
      .catch((error) => {
        console.log("Something unexpected happened: " + error);
      });

  }, [userContext]);

  const handleLogin = () => {
    userContext.login();
  };

  const handleLogout = () => {
    userContext.logout();
  }

  const handleShow = _ => {
    console.log(userContext.idToken);
  };

  const LogoutButton = () => {
    return <button variant="secondary" className="ml-auto" onClick={() => handleLogout()}>Sign out</button>
  };

  const LoginButton = () => {
    return <button variant="secondary" className="ml-auto" onClick={handleLogin}>Sign in using Redirect</button>
  };

  const ShowTokenButton = () => {
    return <button variant="secondary" className="ml-auto" onClick={() => handleShow()}>Show Token</button>
  };

  const UserDetails = () => {
    return (
      <div>
        { userContext.status === 'pending' ?
            <CircularProgress />
        :
          <>username: { userContext.displayName }</>
        }
      </div>
    );
  };

  const handleShowContext = () => {
    console.log("DisplayName: " + userContext.displayName);
  }

  const handleChangeStateState = (state) => {
    userContext.setStatus(state);
  }

  return (
    <>
      <div>
        { userContext.status === 'logged_in' ?
          "Logged In" :
          userContext.status === 'logged_out' ?
            "Logged Out" :
            "Login Pending"
        }
      </div>

      <UserDetails/>

      { userContext.status === 'logged_in' ?
        <LogoutButton/> :
        <LoginButton/>
      }

      <ShowTokenButton/>

      <div>Login status is: "{ userContext.status }" </div>
      <button onClick={() => handleChangeStateState('logged_out')}>Change to logged_out</button>
      <button onClick={() => handleChangeStateState('pending')}>Change to pending</button>
      <button onClick={() => handleChangeStateState('logged_in')}>Change to logged_in</button>

      <button variant="secondary" className="ml-auto" onClick={handleShowContext}>Show Context</button>

    </>
  );
}
