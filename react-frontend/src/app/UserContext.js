import React from 'react';

let localStorage = window.localStorage;
let _azureAuth;

let user;
let setUser = (u) => user = u;  // Override this via initUser when running in React

const setUserInfo = (info) => {
  user = new Proxy(info, metaHandler);
  setUser(user);
};

const persistedFields = [
  'displayName',
  'email',
  'photoURL',
  'token',
  'tokenFromProvider',
  'providerId',
  'lastSignInTime',
  'loginStatus',
];


const clearAppStorage = () => {
  persistedFields.forEach(prop => {
    localStorage.removeItem(prop);
  });
};

let ctx = {
  initialized: false,
  loginStatus: 'logged_out',

  login: () => {
    localStorage.setItem('loginStatus', 'pending');
    _azureAuth.signInMicrosoft();
  },

  logout: () => {
    clearAppStorage();

    user.updateKeys({
      ...ctx
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
      displayName:       localStorage.getItem('displayName') ?? 'NONE',
      loginStatus:       localStorage.getItem('loginStatus') ?? 'logged_out',
      initialized:       true,
      email:             localStorage.getItem('email'),
      photoURL:          localStorage.getItem('photoURL'),
      token:             localStorage.getItem('token'),
      tokenFromProvider: localStorage.getItem('tokenFromProvider'),
      providerId:        localStorage.getItem('providerId'),
      lastSignInTime:    localStorage.getItem('lastSignInTime'),
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
    for (const prop in object) {
      const value = object[prop];
      if (shouldPropBePersisted(prop, value))
        localStorage.setItem(prop, value);
    }
  }
};

const metaHandler = {
  set(target, prop, value, receiver) {
    // Don't touch storage or the context state if we don't have anything to change
    if (target[prop] === value) return true;

    if ( shouldPropBePersisted(prop) )
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

const shouldPropBePersisted = (prop, value) => {
  return (persistedFields.includes(prop) &&
      value !== '' && value != null &&
      typeof(value) !== Function);
};

const UserContext = React.createContext(generateNewImmutableUser(ctx));
export default UserContext;
