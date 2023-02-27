import { useContext, useEffect } from 'react';
import {
  Avatar,
  CircularProgress, IconButton,
} from '@mui/material';

import MailIcon from '@mui/icons-material/Mail';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import './UserCard.css';
import UserContext from '../../app/UserContext';
import AppConfig from '../../AppConfig';
import { lookupMsAzureProfilePhoto } from '../../app/AzureAuth';
import UserCardMenu from './UserCardMenu';

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

  const minimize = () => {

  };

  switch (userContext.loginStatus) {
    case 'logged_out':
      return (
        <></>
      );
    case 'logged_in':
      console.debug('rendering UserCard since logged in, photoURL: ' + userContext.photoURL);
      return (
        <div className='user-card'>
          <img src={userContext.photoURL} />
          <div className='display-name'>{userContext.displayName}</div>
          <div className='email'>
            <MailIcon></MailIcon>
            <span>{userContext.email}</span>
          </div>
          <UserCardMenu />
          <div className='minimize-button'>
            <Avatar>
              <IconButton
                variant="outlined" onClick={minimize}>
                <ExpandLessIcon />
              </IconButton>
            </Avatar>
          </div>
        </div>
      );
    case 'pending':
    default:
      return (
        <div className='user-card'>
          <div className='pending'>
            <CircularProgress />
          </div>
        </div>
      );
  }
};

export default UserCard;
