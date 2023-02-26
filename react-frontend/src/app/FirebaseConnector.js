import { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import UserContext from './UserContext';
import { getFirebaseUser, initApp } from './AzureAuth';
import AppConfig from '../AppConfig';

const FirebaseConnector = ({children}) => {
  const userContext = useContext(UserContext);

  useEffect(() => {
    console.debug('socket connector is attaching');

    if (AppConfig.APP_ENV === 'local-test') {
      // TODO: Add application logic for after successful authentication here
      return;
    }

    initApp().then(result => {
      if (result != null) {
        console.debug('catchRedirectSignInMicrosoft: User appears to be logged in with Firebase Auth.');
        const user = result.user;
        const credential = result.credential;

        let providerId = 'NO PROVIDER';
        if (user.providerData[0]?.providerId != null) providerId = user.providerData[0]?.providerId;
        console.log(`User logged in via ${providerId}`);

        userContext.fillUserInfoFromRedirect(user, credential);
        // TODO: Add application logic for after successful authentication here
        return;
      }

      console.debug('catchRedirectSignInMicrosoft: resulted in a null return object');
      console.debug('catchRedirectSignInMicrosoft: userContext.loginStatus:' + userContext.loginStatus);
      if (checkIfWeAreInAPotentiallyStuckPendingState()) {
        console.log('loginStatus was pending, but catchRedirectSignInMicrosoft response was null.  Setting status to logged_out in case we\'re in a stuck state.');
        userContext.setLoginStatus('logged_out');
        return;
      }

      const user = getFirebaseUser();
      if (checkIfAlreadyLoggedInViaSomePersistenceFromFirebase(user)) {
        user?.getIdToken()
          .then((token) => {
            userContext.setIdToken(token);
            // TODO: Add application logic for after successful authentication here
          })
          .catch((err) => console.log(err));

        return;
      }

      if (checkIfOurLoginStatusIndicatesALoginEvenThoughFirebaseDisagrees()) {
        console.warn('catchRedirectSignInMicrosoft: returned a null Firebase user, and userContext.loginStatus was logged_in.  Logging out (possibly causing problems).');
        userContext.logout();
      }

    }).catch(err => console.log(err));

  }, []);


  const checkIfWeAreInAPotentiallyStuckPendingState = () => {
    return userContext.loginStatus === 'pending';
  };

  const checkIfAlreadyLoggedInViaSomePersistenceFromFirebase = (user) => {
    return user != null;
  };

  const checkIfOurLoginStatusIndicatesALoginEvenThoughFirebaseDisagrees = () => {
    return userContext.loginStatus === 'logged_in';
  };

  return (
    <>
      {children}
    </>
  );
};

FirebaseConnector.propTypes = {
  children: PropTypes.element.isRequired,
};

export default FirebaseConnector;
