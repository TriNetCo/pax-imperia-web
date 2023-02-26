import { useContext, useEffect } from 'react';

import './UserCard.css';
import UserContext from '../../app/UserContext';
import AppConfig from '../../AppConfig';

const UserCard = () => {
  const userContext = useContext(UserContext);
  let doneWithPhotoLookups = false;

  const lookupMsAzureProfilePhoto = async (token) => {
    return fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
      headers: {
        Authorization: `Bearer ${token}`,
        pragma: 'no-cache',
        'cache-control': 'no-cache',
        'Content-Type': 'image/jpg',
      }
    }).then(async function (response) {
      if (response.status === 200)
        return await response.blob();
      if (response.status === 401) {
        console.log('Recieved unauthorized response while querying photo from MS Azure.  The token is probably expired therefore logging out.');
        logout();
      }
      if (response.status === 404) {
        console.log('404 received during profile picture lookup, user likely has no photo.');
        return;
      }

      console.log('Recieved unexpected response code while querying graph.microsoft.com: ' + response.statusText);
    }).then(function (blob) {
      if (blob == null) return null;
      return URL.createObjectURL(blob);
      // setProfilePicUrl(imageObjectURL);
    }).catch(e => {
      console.log('error injecting photo');
      console.log(e);
    });
  };

  const asyncEffect = async () => {
    const photoURL = await lookupMsAzureProfilePhoto(userContext.tokenFromProvider);
    if (photoURL != null)
      userContext.setPhotoURL(photoURL);
  };

  useEffect(() => {
    if (AppConfig.APP_ENV === 'local-test') return;
    if (userContext.providerId === 'microsoft.com' && !doneWithPhotoLookups) {
      asyncEffect();
      doneWithPhotoLookups = true;
    }
  }, []);

  return (
    <div className='user-card'>
      <img
        src={userContext.photoURL}
        style={{ maxWidth: '40px', borderRadius: '50%' }} />
      <div>
        FACE PIC
      </div>
      <div>User: {userContext.displayName}</div>
      <div>Hamburger</div>
    </div>
  );
};

export default UserCard;
