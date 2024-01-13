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

    login: async () => {
        localStorage.setItem('loginStatus', 'pending');

        if (_azureAuth.redirectStrategy === 'redirect') {
            // This was for login via redirect which is a broken trash feature
            _azureAuth.signInMicrosoft();
            // A redirect takes place so this is never called
            console.log('HIHIHIHIHI FROM THE PAST, I WAS WRONG!');
            return;
        }
        return _azureAuth.signInMicrosoftPopup();
    },

    // loginWithRedirect: () => {
    //     localStorage.setItem('loginStatus', 'pending');
    //     _azureAuth.signInMicrosoft();
    // },
    // loginWithPopup: async () => {
    //     localStorage.setItem('loginStatus', 'pending');
    //     return _azureAuth.signInMicrosoftPopup();
    // },

    logout: () => {
        CTX.updateKeys({
            ...CTX
        });
        CTX.setUserInfo(dataShell);
        CTX.clearAppStorage();
        _azureAuth.signOutMicrosoft();
    },

    fillUserInfoFromProviderData: (usr, credential) => {
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

// This code is so unsafe this static function is the only gaurenteed way to dodge bugs
export const extractAuthData = (userContext) => {
    let authData = {
        email: userContext.email,
        displayName: userContext.displayName,
        token: userContext.token,
    };

    if (!authData.displayName) {
        authData = {
            email: 'anonymous@example.com',
            displayName: 'anonymous',
            token: 'anonymous',
        };
    }
    return authData;
};

let UserContext = React.createContext();
export default UserContext;
