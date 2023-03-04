import React from 'react';

let _azureAuth;
let dataShell; // Proxy
let data;      // Underlying Data
let setUser = (proxy) => dataShell = proxy;  // Override this via initUser when running in React

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
    setUser(new Proxy(info, metaHandler));
  },

  login: () => {
    localStorage.setItem('loginStatus', 'pending');
    _azureAuth.signInMicrosoft();
  },

  logout: () => {
    dataShell.updateKeys({
      ...CTX
    });
    CTX.setUserInfo(dataShell);
    CTX.clearAppStorage();
    _azureAuth.signOutMicrosoft();
  },

  fillUserInfoFromRedirect: (usr, credential) => {
    const profileBlobPicUrl = (usr.photoURL != null && usr.photoURL !== '')
      ? usr.photoURL
      : '/web_assets/defaultProfilePicture.png';

    dataShell.updateKeys({
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
    dataShell.updateStorage(dataShell);

    CTX.setUserInfo(dataShell);
  },

  fillUserInfoFromLocalStorage: () => {
    // dataShell.updateKeys({
    //   ...CTX,
    //   ...CTX.pullNonNullLocalStorageValues(),
    //   initialized:       true,
    // });
    Object.assign(data, {
      ...CTX,
      ...CTX.pullNonNullLocalStorageValues(),
      initialized:       true,
    });

    CTX.setUserInfo(dataShell);
  },

  overrideStorage: (storage) => {
    localStorage = storage;
  },

  // Private

  pullNonNullLocalStorageValues: () => {
    const storageRaw = {
      loginStatus:       localStorage.getItem('loginStatus'),
      displayName:       localStorage.getItem('displayName'),
      email:             localStorage.getItem('email'),
      photoURL:          localStorage.getItem('photoURL'),
      token:             localStorage.getItem('token'),
      tokenFromProvider: localStorage.getItem('tokenFromProvider'),
      providerId:        localStorage.getItem('providerId'),
      lastSignInTime:    localStorage.getItem('lastSignInTime'),
    };

    // remove null properties
    return Object.fromEntries(Object.entries(storageRaw).filter(([_, v]) => v != null));
  },

  updateKeys: (object) => {
    for (const prop in object) {
      const value = object[prop];
      if (!CTX.shouldPropBeAllowed(prop, value)) {
        return false;
      }
      dataShell[prop] = value;
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
    if (target[prop] === value) return true;
    if (!target.shouldPropBeAllowed(prop, value)) return false;

    if ( target.shouldPropBePersisted(prop, value) ) {
      localStorage.setItem(prop, value);
      console.log('STORAGE SET: ' + prop);
      if (prop == 'photoURL') console.error('setting photo');
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


const UserContext = React.createContext(createImmutableUser(CTX));
export default UserContext;
