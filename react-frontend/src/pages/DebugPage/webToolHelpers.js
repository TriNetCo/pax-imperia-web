import defaultProfilePicture from 'src/shared/UserCard/defaultProfilePicture.png';

export const spoofSignIn = (provider) => {
  if (provider == null) provider = 'microsoft.com';
  const usr = {
    displayName: 'Its Me',
    email: 'me@example.com',
    photoURL: defaultProfilePicture,
    accessToken: 'mockAccessToken',
    metadata: {
      lastSignInTime: 'Thu, 05 Jan 2023 23:35:09 GMT'
    }
  };

  const credential = {
    accessToken: 'mockProviderAccessToken',
  };

  localStorage.setItem('displayName', usr.displayName);
  localStorage.setItem('email', usr.email);
  localStorage.setItem('photoURL', usr.photoURL);
  localStorage.setItem('token', usr.accessToken);
  localStorage.setItem('tokenFromProvider', credential.accessToken);
  localStorage.setItem('lastSignInTime', usr.metadata.lastSignInTime);
  localStorage.setItem('loginStatus', 'logged_in');
  localStorage.setItem('providerId', provider);
};

export const clearLocalStorage = () => {
  localStorage.removeItem('displayName');
  localStorage.removeItem('email');
  localStorage.removeItem('photoURL');
  localStorage.removeItem('token');
  localStorage.removeItem('tokenFromProvider');
  localStorage.removeItem('lastSignInTime');
  localStorage.removeItem('loginStatus');
  localStorage.removeItem('providerId');
};
