export const spoofSignIn = (provider) => {
  if (provider == null) provider = 'microsoft.com';
  const usr = {
    displayName: 'Its Me',
    email: 'me@example.com',
    photoURL: '/web_assets/defaultProfilePicture.png',
    metadata: {
      lastSignInTime: 'Thu, 05 Jan 2023 23:35:09 GMT'
    }
  };

  const credential = {
    accessToken: 'mockAccessToken',
    idToken: 'mockIdToken',
  };

  localStorage.setItem('displayName', usr.displayName);
  localStorage.setItem('email', usr.email);
  localStorage.setItem('profilePicUrl', usr.photoURL);
  localStorage.setItem('accessToken', credential.accessToken);
  localStorage.setItem('idToken', credential.idToken);
  localStorage.setItem('lastSignInTime', credential.idToken);
  localStorage.setItem('loginStatus', 'logged_in');
  localStorage.setItem('providerId', provider);
};
