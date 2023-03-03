import { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import UserContext from './UserContext';
import AppConfig from '../AppConfig';

// TODO: This will likely be injected from somewhere else
export const applicationLogicToCallOnAuthInit = () => {
  console.log('TODO: add application logic');
};

export const redirectSuccessHandler = (userContext) => {
  return (result) => {
    if (result == null) return;

    console.debug('redirectSuccessHandler: User appears to be logged in with Firebase Auth.');
    const user = result.user;
    const credential = result.credential;

    userContext.fillUserInfoFromRedirect(user, credential);
    // TODO: Add application logic for after successful authentication here
    applicationLogicToCallOnAuthInit();
    throw 'end handler chain';
  };
};

export const redirectStuckHandler = (userContext) => {
  return () => {
    if (!checkIfWeAreInAPotentiallyStuckPendingState()) return;
    console.log('loginStatus was pending, but catchRedirectSignInMicrosoft response was null.  Setting status to logged_out in case we\'re in a stuck state.');
    userContext.setLoginStatus('logged_out');
    throw 'end handler chain';

    function checkIfWeAreInAPotentiallyStuckPendingState() {
      return userContext.loginStatus === 'pending';
    }
  };
};

export const alreadyLoggedInHandler = (userContext) => {
  return (user) => {
    userContext.setIdToken(token);
    // TODO: Add application logic for after successful authentication here
    applicationLogicToCallOnAuthInit();
    throw 'end handler chain';
  };
};

export const loginExpiredHandler = (userContext) => {
  return () => {
    if (checkIfOurLoginStatusIndicatesALoginEvenThoughFirebaseDisagrees()) {
      console.warn('catchRedirectSignInMicrosoft: returned a null Firebase user, and userContext.loginStatus was logged_in.  Logging out.');
      userContext.logout();
      throw 'end handler chain';
    }

    const checkIfOurLoginStatusIndicatesALoginEvenThoughFirebaseDisagrees = () => {
      return userContext.loginStatus === 'logged_in';
    };
  };
};


const FirebaseConnector = ({children, azureAuth}) => {
  const userContext = useContext(UserContext);

  useEffect(() => {
    console.debug('socket connector is attaching');

    if (AppConfig.APP_ENV === 'local-test') {
      // TODO: Add application logic for after successful authentication here
      return;
    }

    azureAuth.initLoginContext({
      redirectSuccessHandler: redirectSuccessHandler(userContext),
      redirectStuckHandler: redirectStuckHandler(userContext),
      alreadyLoggedInHandler: alreadyLoggedInHandler(userContext),
      loginExpiredHandler: loginExpiredHandler(userContext),
    });

  }, []);

  return (
    <>
      {children}
    </>
  );
};

FirebaseConnector.propTypes = {
  children:  PropTypes.element.isRequired,
  azureAuth: PropTypes.object.isRequired,
};

export default FirebaseConnector;
