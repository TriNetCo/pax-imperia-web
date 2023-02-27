// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  OAuthProvider,
  signInWithRedirect
} from 'firebase/auth';
import AppConfig from '../AppConfig';

const config = {
  apiKey: AppConfig.FIREBASE_API_KEY,
  authDomain: AppConfig.AUTH_DOMAIN,
  projectId: AppConfig.GOOGLE_PROJECT_ID,
  storageBucket: `${AppConfig.GOOGLE_PROJECT_ID}.appspot.com`,
  messagingSenderId: '197061503647',
  appId: '1:197061503647:web:ddb8057e008e53ab6ad0aa',
  measurementId: 'G-8QVSYPR5KT',
};

let app;
let auth;
const provider = new OAuthProvider('microsoft.com').setCustomParameters({
  // tenant: config.tenant,
  // prompt: 'select_account',
});

async function initApp() {
  app  = await initializeApp(config);
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

export { signInMicrosoft, signOutMicrosoft, initApp, getAuthOutput, getFirebaseUser, lookupMsAzureProfilePhoto };
