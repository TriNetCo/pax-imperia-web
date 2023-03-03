import { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import UserContext from './UserContext';
import AppConfig from '../AppConfig';

const FirebaseConnector = ({children, azureAuth}) => {
  const userContext = useContext(UserContext);

  const applicationLogicToCallOnAuthInit = () => {
    alert('TODO: add application logic');
  };

  const handleSuccessfulRedirectReturn = (result) => {
    if (result == null) return;

    console.debug('handleSuccessfulRedirectReturn: User appears to be logged in with Firebase Auth.');
    const user = result.user;
    const credential = result.credential;

    userContext.fillUserInfoFromRedirect(user, credential);
    // TODO: Add application logic for after successful authentication here
    applicationLogicToCallOnAuthInit();
    throw 'end handler chain';
  };

  const handleStuckPendingState = () => {
    if (!checkIfWeAreInAPotentiallyStuckPendingState()) return;
    console.log('loginStatus was pending, but catchRedirectSignInMicrosoft response was null.  Setting status to logged_out in case we\'re in a stuck state.');
    userContext.setLoginStatus('logged_out');
    throw 'end handler chain';

    function checkIfWeAreInAPotentiallyStuckPendingState() {
      return userContext.loginStatus === 'pending';
    }
  };

  const handleAlreadyBeingLoggedIntoFirebase = (user) => {
    userContext.setIdToken(token);
    // TODO: Add application logic for after successful authentication here
    applicationLogicToCallOnAuthInit();
    throw 'end handler chain';
  };

  const handleThatOurFirebaseDoesntRecognizeWereLoggedInButUserContextIsOutOfDate = () => {
    if (checkIfOurLoginStatusIndicatesALoginEvenThoughFirebaseDisagrees()) {
      console.warn('catchRedirectSignInMicrosoft: returned a null Firebase user, and userContext.loginStatus was logged_in.  Logging out.');
      userContext.logout();
      throw 'end handler chain';
    }

    const checkIfOurLoginStatusIndicatesALoginEvenThoughFirebaseDisagrees = () => {
      return userContext.loginStatus === 'logged_in';
    };
  };


  useEffect(() => {
    console.debug('socket connector is attaching');

    if (AppConfig.APP_ENV === 'local-test') {
      // TODO: Add application logic for after successful authentication here
      return;
    }

    azureAuth.initLoginContext({
      redirectSuccessHandler: handleSuccessfulRedirectReturn,
      redirectStuckHandler: handleStuckPendingState,
      alreadyLoggedInHandler: handleAlreadyBeingLoggedIntoFirebase,
      loginExpiredHandler: handleThatOurFirebaseDoesntRecognizeWereLoggedInButUserContextIsOutOfDate
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
