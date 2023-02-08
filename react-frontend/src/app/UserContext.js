import React from 'react';

import { initApp, signInMicrosoft, signOutMicrosoft } from './AzureAuth';

let user;
let setUser;

const initUser = (setStateFunc) => {
  setUser = setStateFunc;
};

const setUserInfo = (info) => {
  user = info;
  setUser(user);
};

const fillUserInfoFromLocalStorage = () => {
  setUserInfo({
    ...ctx,
    displayName: localStorage.getItem('displayName') ?? 'NONE',
    email:       localStorage.getItem('email') ?? '',
    profilePic:  localStorage.getItem('photoURL') ?? '',
    token: localStorage.getItem('token') ?? '',
    tokenFromProvider:     localStorage.getItem('tokenFromProvider') ?? '',
    lastSignInTime: localStorage.getItem('lastSignInTime') ?? '',
    loginStatus: localStorage.getItem('loginStatus') ?? 'logged_out',
    initialized: true,
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
  localStorage.removeItem('lastSignInTime');
  localStorage.removeItem('loginStatus');

  setUserInfo({
    ...ctx,
    loginStatus: 'logged_out'
  });
  signOutMicrosoft();
};

const fillUserInfoFromRedirect = (result, credential) => {
  const usr = result;

  localStorage.setItem('displayName', usr.displayName);
  localStorage.setItem('email', usr.email);
  localStorage.setItem('photoURL', usr.photoURL);
  localStorage.setItem('token', usr.accessToken);
  localStorage.setItem('tokenFromProvider', credential.accessToken);
  localStorage.setItem('lastSignInTime', usr.metadata.lastSignInTime);
  localStorage.setItem('loginStatus', 'logged_in');

  setUserInfo({
    ...ctx,
    displayName: usr.displayName ?? '',
    email: usr.email ?? '',
    profilePic: usr.photoURL ?? '',
    token: usr.accessToken ?? '',
    tokenFromProvider: credential.accessToken ?? '',
    lastSignInTime: usr.metadata.lastSignInTime,
    loginStatus: 'logged_in',
  });
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

const ctx = {
  displayName: 'NONE',
  profilePic: '',
  email: '',
  token: '',
  tokenFromProvider: '',
  loginStatus:  '',
  initialized: false,
  lastSignInTime: null,

  setLoginStatus,
  setDisplayName,
  login,
  logout,
  fillUserInfoFromRedirect,
  fillUserInfoFromLocalStorage,
  initUser,
  initApp,
};


export const createUserContext = () => {
  return ctx;
};


export const UserContext = React.createContext(ctx);
