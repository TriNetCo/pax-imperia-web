export const spoofSignIn = (localStorage, provider) => {
  if (provider == null) provider = 'microsoft.com';
  const usr = {
    displayName: 'Its Me',
    email: 'me@example.com',
    photoURL: '/web_assets/defaultProfilePicture.png',
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
