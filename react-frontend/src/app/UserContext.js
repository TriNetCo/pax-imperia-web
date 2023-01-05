import React from 'react';

import { initApp, signInMicrosoft, signOutMicrosoft } from './AzureAuth';

let user;
let setUser;

const initUser = (setStateFunc) => {
  setUser = setStateFunc;
}

const setUserInfo = (info) => {
  user = info;
  setUser(user);
};

const fillUserInfoFromLocalStorage = () => {
  setUserInfo({
    ...ctx,
    displayName: localStorage.getItem("displayName") ?? 'NONE',
    email:       localStorage.getItem("email") ?? '',
    profilePic:  localStorage.getItem("photoURL") ?? '',
    accessToken: localStorage.getItem("accessToken") ?? '',
    idToken:     localStorage.getItem("idToken") ?? '',
    lastSignInTime: localStorage.getItem("lastSignInTime") ?? '',
    loginStatus:      localStorage.getItem('loginStatus') ?? 'logged_out',
    initialized: true,
  });
};

const login = () => {
  localStorage.setItem('loginStatus', 'pending')
  signInMicrosoft();
};

const logout = () => {
  localStorage.removeItem("displayName");
  localStorage.removeItem("email")
  localStorage.removeItem("photoURL")
  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("lastSignInTime");
  localStorage.removeItem("loginStatus");

  setUserInfo({
    ...ctx,
    loginStatus: 'logged_out'
  });
  signOutMicrosoft();
};

const fillUserInfoFromRedirect = (result, credential) => {
  const usr = result;

  localStorage.setItem("displayName", usr.displayName)
  localStorage.setItem("email", usr.email)
  localStorage.setItem("photoURL", usr.photoURL)
  localStorage.setItem("accessToken", credential.accessToken);
  localStorage.setItem("idToken", credential.idToken);
  localStorage.setItem("lastSignInTime", usr.metadata.lastSignInTime)
  localStorage.setItem('loginStatus', 'logged_in');

  setUserInfo({
    ...ctx,
    displayName: usr.displayName ?? '',
    email: usr.email ?? '',
    profilePic: usr.photoURL ?? '',
    accessToken: credential.accessToken ?? '',
    idToken: credential.idToken ?? '',
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
}

const ctx = {
  displayName: 'NONE',
  profilePic: '',
  email: '',
  accessToken: '',
  idToken: '',
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


export const createMyContext = () => {
  return ctx;
}


export const UserContext = React.createContext(ctx);
