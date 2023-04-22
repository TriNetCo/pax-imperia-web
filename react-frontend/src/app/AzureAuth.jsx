// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  OAuthProvider,
  signInWithRedirect
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import AppConfig from '../AppConfig';

const config = {
  apiKey: AppConfig.FIREBASE_API_KEY,
  authDomain: AppConfig.AUTH_DOMAIN,
  projectId: AppConfig.GOOGLE_PROJECT_ID,
  storageBucket: `${AppConfig.GOOGLE_PROJECT_ID}.appspot.com`,
  messagingSenderId: '197061503647',
  appId: '1:197061503647:web:ddb8057e008e53ab6ad0aa',
  measurementId: 'G-7DWTH6NHTD',
};

let app;
let auth;
let analytics;
const provider = new OAuthProvider('microsoft.com').setCustomParameters({
  // tenant: config.tenant,
  // prompt: 'select_account',
});


async function initApp() {
  app  = await initializeApp(config);
  analytics = getAnalytics(app);
  auth = await getAuth(app);
  // if (AppConfig.APP_ENV === 'local-test')
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  return await catchRedirectSignInMicrosoft();
}

async function signInMicrosoft() {
  signInWithRedirect(auth, provider).catch(error => console.log(error));
}

async function signOutMicrosoft() {
  await getAuth().signOut();
}

async function catchRedirectSignInMicrosoft() {
  const result = await getRedirectResult(auth);

  if (result == null) {
    return;
  }

  return ({
    user:       result.user,
    credential: OAuthProvider.credentialFromResult(result)
  });
}

const lookupMsAzureProfilePhoto = async (token) => {
  return fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
    headers: {
      Authorization: `Bearer ${token}`,
      pragma: 'no-cache',
      'cache-control': 'no-cache',
      'Content-Type': 'image/jpg',
    }
  }).then(async function (response) {
    if (response.status === 200)
      return await response.blob();
    if (response.status === 401) {
      console.log('Recieved unauthorized response while querying photo from MS Azure.  The token is probably expired therefore logging out.');
      // logout();
    }
    if (response.status === 404) {
      console.log('404 received during profile picture lookup, user likely has no photo.');
      return;
    }

    console.log('Recieved unexpected response code while querying graph.microsoft.com: ' + response.statusText);
  }).then(function (blob) {
    if (blob == null) return null;
    return URL.createObjectURL(blob);
  }).catch(e => {
    console.log('error injecting photo');
    console.log(e);
  });
};

async function getAuthOutput() {
  if (auth == null)
    await initApp();
  return await getAuth().currentUser.getIdToken();
}

function getFirebaseUser() {
  return auth.currentUser;
}

// TODO: refactor all of above functions into the below class.
export default class AzureAuth {
  constructor() {
  }

  /* initLoginContext will call 1 of the 4 handlers based on the scenario was have going with firebase:
   * - redirectSuccessHandler: When we're coming back to the app from a redirect with login OAuth
   * - redirectStuckHandler: When something exceptional took place during the login process and our local context thinks we're pending a login redirect, but redirect information isn't coming in right
   * - alreadyLoggedInHandler: When we're already logged in via firefox and only need to check to see if we need to update our login token
   * - loginExpiredHandler: When our local login context thinks we're logged in, but firebase probably knows our login has expired
   */
  async initLoginContext(handlers) {
    const result = await initApp();

    try {
      handlers.redirectSuccessHandler(result);  // The first function in this chain to find that it is the appropriate handler for the situation will handle the situation and throw an exception to exit the call chain
      handlers.redirectStuckHandler();

      // Okay... we're not in a redirect cycle... let's see if we're logged in
      const user = azureAuth.getFirebaseUser();
      if (checkIfAlreadyLoggedInViaSomePersistenceFromFirebase(user)) {
        user?.getIdToken()
          .then((token) => {
            handlers.alreadyLoggedInHandler(token);
          })
          .catch((err) => console.log(err));
      }

      handlers.loginExpiredHandler();

    } catch (exception) { }

    function checkIfAlreadyLoggedInViaSomePersistenceFromFirebase (user) {
      return user != null;
    };
  }

  async initApp() {
    return await initApp();
  }

  async signInMicrosoft() {
    return await signInMicrosoft();
  }

  async signOutMicrosoft() {
    return await signOutMicrosoft();
  };

  async getAuthOutput() {
    return await getAuthOutput();
  }

  getFirebaseUser() {
    getFirebaseUser();
  }

  async lookupMsAzureProfilePhoto() {
    return await lookupMsAzureProfilePhoto();
  }

}

export { signInMicrosoft, signOutMicrosoft, initApp, getAuthOutput, getFirebaseUser, lookupMsAzureProfilePhoto };
