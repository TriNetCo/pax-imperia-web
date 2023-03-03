import React from 'react';

let localStorage = window.localStorage;
let _azureAuth;

let user;
let setUser = (u) => user = u;  // Override this via initUser when running in React

const setUserInfo = (info) => {
  user = new Proxy(info, metaHandler);
  setUser(user);
};

const clearAppStorage = () => {
  localStorage.removeItem('displayName');
  localStorage.removeItem('email');
  localStorage.removeItem('photoURL');
  localStorage.removeItem('token');
  localStorage.removeItem('tokenFromProvider');
  localStorage.removeItem('providerId');
  localStorage.removeItem('lastSignInTime');
  localStorage.removeItem('loginStatus');
};

let ctx = {
  initialized: false,

  login: () => {
    localStorage.setItem('loginStatus', 'pending');
    _azureAuth.signInMicrosoft();
  },

  logout: () => {
    clearAppStorage();

    user.updateKeys({
      ...ctx,
      loginStatus: 'logged_out'
    });
    setUserInfo(user);

    _azureAuth.signOutMicrosoft();
  },

  fillUserInfoFromRedirect: (usr, credential) => {
    const profileBlobPicUrl = (usr.photoURL != null && usr.photoURL !== '')
      ? usr.photoURL
      : '/web_assets/defaultProfilePicture.png';

    user.updateKeys({
      ...ctx,
      displayName: usr.displayName,
      email: usr.email,
      photoURL: profileBlobPicUrl,
      token: usr.accessToken,
      tokenFromProvider: credential.accessToken,
      providerId: credential.providerId,
      lastSignInTime: usr.metadata.lastSignInTime,
      loginStatus: 'logged_in',
    });
    user.updateStorage(user);

    setUserInfo(user);
  },

  fillUserInfoFromLocalStorage: () => {
    user.updateKeys({
      ...ctx,
      displayName:       localStorage.getItem('displayName'),
      email:             localStorage.getItem('email'),
      photoURL:          localStorage.getItem('photoURL'),
      token:             localStorage.getItem('token'),
      tokenFromProvider: localStorage.getItem('tokenFromProvider'),
      providerId:        localStorage.getItem('providerId'),
      lastSignInTime:    localStorage.getItem('lastSignInTime'),
      loginStatus:       localStorage.getItem('loginStatus') ?? 'logged_out',
      initialized:       true,
    });

    setUserInfo(user);
  },

  initUser: (setStateFunc) => {
    setUser = setStateFunc;
  },

  overrideStorage: (storage) => {
    localStorage = storage;
  },

  updateKeys: (object) => {
    for (const property in object) {
      const val = object[property];
      user[property] = val;
    }
  },

  updateStorage: (object) => {
    for (const property in object) {
      const val = object[property];
      if ( typeof(val) !== Function && val !== '' && val != null)
        localStorage.setItem(property, val);
    }
  }
};

const metaHandler = {
  // get(target, name) {
  //   return name in target ? target[name] : 42;
  // },
  set(target, prop, value, receiver) {
    // Don't touch storage or the context state if we don't have anything to change
    if (target[prop] === value) return true;

    localStorage.setItem(prop, value);

    target[prop] = value;
    setUserInfo(target);
    return true;
  },
};

const generateNewImmutableUser = (sourceObj) => {
  return new Proxy({ ...sourceObj }, metaHandler);
};

export const createUserContext = ({ storage, azureAuth } = {}) => {
  user = generateNewImmutableUser(ctx);

  if (storage != null)
    localStorage = storage;

  _azureAuth = azureAuth;
  return user;
};

const UserContext = React.createContext(generateNewImmutableUser(ctx));

export default UserContext;
