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
  authDomain: `${AppConfig.GOOGLE_PROJECT_ID}.firebaseapp.com`,
  projectId: AppConfig.GOOGLE_PROJECT_ID,
  storageBucket: `${AppConfig.GOOGLE_PROJECT_ID}.appspot.com`,
  messagingSenderId: '197061503647',
  appId: '1:197061503647:web:ddb8057e008e53ab6ad0aa',
  measurementId: 'G-8QVSYPR5KT',
  tenant: 'common'
};

debugger;

let app;
let auth;

async function initApp() {
  app  = await initializeApp(config);
  auth = await getAuth(app);
}

async function signInMicrosoft() {
  if (auth === undefined)
    await initApp();
  //   const provider = new OAuthProvider('microsoft.com').setCustomParameters({
  //       tenant: config.tenant
  //   });
  const provider = new OAuthProvider('microsoft.com');
  signInWithRedirect(auth, provider);
}

async function signOutMicrosoft() {
  if (auth == null)
    await initApp();
  await getAuth().signOut();
}

async function catchRedirectSignInMicrosoft() {
  if (!auth)
    await initApp();


  if (auth != null &&
      auth.currentUser != null &&
      auth.currentUser.displayName) {
    return;  // we are already logged in, ensure pending login is set to false so we don't keep looking up our login
  }

  const result = await getRedirectResult(auth);

  if (result == null) {
    return;
  }

  return { user:       result.user,
    credential: OAuthProvider.credentialFromResult(result) };
}

async function getAuthOutput() {
  if (auth == null)
    await initApp();
  return await getAuth().currentUser.getIdToken();
}

export { signInMicrosoft, signOutMicrosoft, catchRedirectSignInMicrosoft, initApp, getAuthOutput };
