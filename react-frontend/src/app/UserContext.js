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
  console.log("Login status was: " + ctx.status)
  setUserInfo({
    ...ctx,
    displayName: localStorage.getItem("displayName") ?? 'NONE',
    email:       localStorage.getItem("email") ?? '',
    profilePic:  localStorage.getItem("photoURL") ?? '',
    accessToken: localStorage.getItem("accessToken") ?? '',
    idToken:     localStorage.getItem("idToken") ?? '',
    status:      localStorage.getItem('login_status') ?? 'logged_out',
    initialized: true,
  });
};

const login = () => {
  localStorage.setItem("login_pending", "true");
  localStorage.setItem('login_status', 'pending')
  signInMicrosoft();
};

const logout = () => {
  localStorage.removeItem("displayName");
  localStorage.removeItem("email")
  localStorage.removeItem("photoURL")
  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("login_status");

  setUserInfo({
    ...ctx,
    status: 'logged_out'
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
  localStorage.setItem('login_status', 'logged_in');

  setUserInfo({
    ...ctx,
    displayName: usr.displayName ?? '',
    email: usr.email ?? '',
    profilePic: usr.photoURL ?? '',
    accessToken: credential.accessToken ?? '',
    idToken: credential.idToken ?? '',
    status: 'logged_in'
  });
};

const setStatus = (val) => {
  localStorage.setItem('login_status', val);

  setUserInfo({
    ...user,
    status: val
  });
};

const ctx = {
  displayName: 'NONE',
  profilePic: '',
  email: '',
  accessToken: '',
  idToken: '',
  status:  '',
  initialized: false,

  setStatus,
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
