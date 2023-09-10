import React from 'react';

import defaultProfilePicture from 'src/shared/UserCard/defaultProfilePicture.png';

let _azureAuth;
let dataShell; // Proxy
let data;      // Underlying Data
let setUser = (proxy) => dataShell = proxy;  // Override this via `userContext.initUser(setUser)` when running in React.  When running fancy tests, override with `userContext.initUser( (internalProxy) => { userContext = internalProxy; } )` you mad genious

const CTX = {
  persistedFields: [
    'displayName',
    'email',
    'photoURL',
    'token',
    'tokenFromProvider',
    'providerId',
    'lastSignInTime',
    'loginStatus',
  ],

  initialized: false,
  loginStatus: 'logged_out',

  initUser: (setStateFunc) => {
    setUser = setStateFunc;
  },

  setUserInfo: (info) => {
    data = {...info};
    dataShell = new Proxy(data, metaHandler);
    setUser(dataShell);
  },

  login: () => {
    localStorage.setItem('loginStatus', 'pending');
    _azureAuth.signInMicrosoft();
  },

  logout: () => {
    CTX.updateKeys({
      ...CTX
    });
    CTX.setUserInfo(dataShell);
    CTX.clearAppStorage();
    _azureAuth.signOutMicrosoft();
  },

  fillUserInfoFromRedirect: (usr, credential) => {
    const profileBlobPicUrl = (usr.photoURL != null && usr.photoURL !== '')
      ? usr.photoURL
      : defaultProfilePicture;

    CTX.updateKeys({
      ...CTX,
      displayName: usr.displayName,
      email: usr.email,
      photoURL: profileBlobPicUrl,
      token: usr.accessToken,
      tokenFromProvider: credential.accessToken,
      providerId: credential.providerId,
      lastSignInTime: usr.metadata.lastSignInTime,
      loginStatus: 'logged_in',
    });
    CTX.updateStorage(dataShell);

    CTX.setUserInfo(dataShell);
  },

  fillUserInfoFromLocalStorage: () => {
    CTX.updateKeys({
      ...CTX,
      ...CTX.pullNonNullLocalStorageValues(),
      initialized:       true,
    });
    CTX.setUserInfo(dataShell);
  },

  // Private

  pullNonNullLocalStorageValues: () => {
    let storageRaw = {};
    CTX.persistedFields.forEach( (prop) => {
      storageRaw[prop] = localStorage.getItem(prop); });

    // remove null properties
    return Object.fromEntries(Object.entries(storageRaw).filter(([_, v]) => v != null));
  },

  updateKeys: (object) => {
    for (const prop in object) {
      const value = object[prop];
      if (!CTX.shouldPropBeAllowed(prop, value)) {
        return false;
      }
      data[prop] = value;
    }
  },

  updateStorage: (object) => {
    for (const prop in object) {
      const value = object[prop];
      if (CTX.shouldPropBePersisted(prop, value))
        localStorage.setItem(prop, value);
    }
  },

  clearAppStorage: () => {
    CTX.persistedFields.forEach(prop => {
      localStorage.removeItem(prop);
    });
  },

  shouldPropBePersisted: (prop, value) => {
    return (CTX.persistedFields.includes(prop) &&
        value !== '' && value != null &&
        typeof(value) !== Function);
  },

  shouldPropBeAllowed: (prop, value) => {
    return (value !== undefined &&
         ( CTX.persistedFields.includes(prop) ||
          {}.hasOwnProperty.call(CTX, prop) ));
  },

};



const metaHandler = {
  set(target, prop, value, receiver) {
    // Don't touch storage or the context state if we don't have anything to change
    if (target[prop] === value) {
      return true;
    }
    if (!CTX.shouldPropBeAllowed(prop, value)) return false;

    if ( CTX.shouldPropBePersisted(prop, value) ) {
      localStorage.setItem(prop, value);
    }

    target[prop] = value;
    CTX.setUserInfo(receiver);
    return true;
  },
};

const createImmutableUser = (sourceObj) => {
  data = { ...sourceObj };
  return new Proxy(data, metaHandler);
};

export const createUserContext = ({ azureAuth } = {}) => {
  dataShell = createImmutableUser(CTX);
  _azureAuth = azureAuth;
  return dataShell;
};

let UserContext = React.createContext();
export default UserContext;
