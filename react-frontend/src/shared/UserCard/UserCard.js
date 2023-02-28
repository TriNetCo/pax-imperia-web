import { useContext, useEffect } from 'react';
import { Button, CircularProgress } from '@mui/material';

import MailIcon from '@mui/icons-material/Mail';
import LoginIcon from '@mui/icons-material/Login';

import './UserCard.css';
import UserContext from '../../app/UserContext';
import AppConfig from '../../AppConfig';
import { lookupMsAzureProfilePhoto } from '../../app/AzureAuth';
import UserCardMenu from './UserCardMenu';
import UserCardCollapser from './UserCardCollapser';

let doneWithPhotoLookups = false;

const UserCard = () => {
  const userContext = useContext(UserContext);

  const asyncEffect = async () => {
    const photoURL = await lookupMsAzureProfilePhoto(userContext.tokenFromProvider);
    if (photoURL != null) {
      userContext.photoURL = photoURL;
      console.debug('set photoURL to ' + photoURL);
    }
  };

  useEffect(() => {
    if (AppConfig.APP_ENV === 'local-test') return;
    if (doneWithPhotoLookups) return;
    if (userContext.providerId === 'microsoft.com') {
      asyncEffect();
      doneWithPhotoLookups = true;
      console.debug('set doneWithPhotoLookups');
    }
  }, [userContext]);


  switch (userContext.loginStatus) {
    case 'logged_out':
      return (
        <UserCardCollapser>
          <div className='user-card'>
            <div className='login-button-container'>
              <Button variant="contained" startIcon={<LoginIcon />}>
                Login
              </Button>
            </div>
          </div>
        </UserCardCollapser>
      );
    case 'logged_in':
      console.debug('rendering UserCard since logged in, photoURL: ' + userContext.photoURL);
      return (
        <UserCardCollapser>
          <div className='user-card'>
            <img src={userContext.photoURL} />
            <div className='display-name'>{userContext.displayName}</div>
            <div className='email'>
              <MailIcon></MailIcon>
              <span>{userContext.email}</span>
            </div>
            <UserCardMenu />
          </div>
        </UserCardCollapser>
      );
    case 'pending':
    default:
      return (
        <UserCardCollapser>
          <div className='user-card'>
            <div className='pending'>
              <CircularProgress />
            </div>
          </div>
        </UserCardCollapser>
      );
  }
};

export default UserCard;
