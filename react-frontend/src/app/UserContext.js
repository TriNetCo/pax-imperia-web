import React from 'react';

import { initApp, signInMicrosoft, signOutMicrosoft } from './AzureAuth';

let user;
let setUser = (u) => user = u;  // Override this via initUser

const initUser = (setStateFunc) => {
  setUser = setStateFunc;
};

const setUserInfo = (info) => {
  user = new Proxy(info, metaHandler);
  setUser(user);
};

const fillUserInfoFromRedirect = (usr, credential) => {
  const profileBlobPicUrl = (usr.photoURL != null && usr.photoURL !== '')
    ? usr.photoURL
    : '/web_assets/defaultProfilePicture.png';

  localStorage.setItem('displayName', usr.displayName);
  localStorage.setItem('email', usr.email);
  localStorage.setItem('photoURL', profileBlobPicUrl);
  localStorage.setItem('token', usr.accessToken);
  localStorage.setItem('tokenFromProvider', credential.accessToken);
  localStorage.setItem('providerId', credential.providerId);
  localStorage.setItem('lastSignInTime', usr.metadata.lastSignInTime);
  localStorage.setItem('loginStatus', 'logged_in');

  setUserInfo({
    ...ctx,
    // ...usr, // TODO: do it this way so the below stuff doesn't require duplicative digging
    displayName: usr.displayName ?? '',
    email: usr.email ?? '',
    photoURL: profileBlobPicUrl ?? '',
    token: usr.accessToken ?? '',
    tokenFromProvider: credential.accessToken ?? '',
    providerId: credential.providerId ?? '',
    lastSignInTime: usr.metadata.lastSignInTime,
    loginStatus: 'logged_in',
  });

};

const fillUserInfoFromLocalStorage = () => {
  setUserInfo({
    ...ctx,
    displayName:       localStorage.getItem('displayName') ?? 'NONE',
    email:             localStorage.getItem('email') ?? '',
    photoURL:          localStorage.getItem('photoURL') ?? '',
    token:             localStorage.getItem('token') ?? '',
    tokenFromProvider: localStorage.getItem('tokenFromProvider') ?? '',
    providerId:        localStorage.getItem('providerId') ?? '',
    lastSignInTime:    localStorage.getItem('lastSignInTime') ?? '',
    loginStatus:       localStorage.getItem('loginStatus') ?? 'logged_out',
    initialized:       true,
  });
};

const login = () => {
  localStorage.setItem('loginStatus', 'pending');
  signInMicrosoft();
};

const logout = () => {
  localStorage.removeItem('displayName');
  localStorage.removeItem('email');
  localStorage.removeItem('photoURL');
  localStorage.removeItem('token');
  localStorage.removeItem('tokenFromProvider');
  localStorage.removeItem('providerId');
  localStorage.removeItem('lastSignInTime');
  localStorage.removeItem('loginStatus');

  setUserInfo({
    ...ctx,
    loginStatus: 'logged_out'
  });
  signOutMicrosoft();
};

const setLoginStatus = (val) => {
  localStorage.setItem('loginStatus', val);

  setUserInfo({
    ...user,
    loginStatus: val
  });
};

const setDisplayName = (val) => {
  localStorage.setItem('displayName', val);

  setUserInfo({
    ...user,
    displayName: val
  });
};

const setIdToken = (newToken) => {
  if (newToken === localStorage.getItem('idToken')) return;

  localStorage.setItem('idToken', newToken);

  setUserInfo({
    ...user,
    idToken: newToken
  });
};

const metaHandler = {
  // get(target, name) {
  //   return name in target ? target[name] : 42;
  // },
  set(target, prop, value, receiver) {
    console.debug(`setting userContext property: ${prop} = ${value}`);

    // Don't touch storage or the context state if we don't have anything to change
    if (user[prop] === value) return;

    localStorage.setItem(prop, value);

    const newUser = {
      ...user
    };
    newUser[prop] = value;
    setUserInfo(newUser);

    return true;
  },
};

const ctx = new Proxy({
  displayName: 'NONE',
  photoURL: '',
  email: '',
  token: '',
  tokenFromProvider: '',
  providerId: '',
  loginStatus:  '',
  initialized: false,
  lastSignInTime: null,

  setLoginStatus,
  setDisplayName,
  setIdToken,
  login,
  logout,
  fillUserInfoFromRedirect,
  fillUserInfoFromLocalStorage,
  initUser,
  initApp,
}, metaHandler);
user = ctx;

export const createUserContext = () => {
  return ctx;
};

const UserContext = React.createContext(ctx);

export default UserContext;
