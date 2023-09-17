import { Avatar, Button, Collapse, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserContext from '../../app/UserContext';

const UserCardCollapser = ({children}) => {
  const userContext = useContext(UserContext);
  const [showing, setShowing] = useState(false);

  const featureFullyHideWhenLoggedOut = true;
  const loggedOutSize = featureFullyHideWhenLoggedOut ? 0 : 40;

  let collapsedSize = userContext.loginStatus === 'logged_out' ? loggedOutSize : 20;

  const minimize = () => {
    setShowing( (prev) => !prev );
  };

  const handleLogin = () => {
    userContext.login();
    setShowing(true);
  };

  // Always minimize when logged out
  if (userContext.loginStatus === 'logged_out' && showing) {
    setShowing(false);
  }

  return (
    <>
      <div className='user-card-container'>

        <Collapse in={showing} collapsedSize={collapsedSize}>
          {children}
        </Collapse>

        <div className='minimize-button'>
          { userContext.loginStatus === 'logged_out' ?
            <></> :
            <Avatar>
              <IconButton
                variant="outlined" onClick={minimize}>
                { showing ?
                  <ExpandLessIcon /> :
                  <ExpandMoreIcon />
                }
              </IconButton>
            </Avatar>
          }
        </div>
      </div>
    </>
  );
};

UserCardCollapser.propTypes = {
  children: PropTypes.element.isRequired,
};

export default UserCardCollapser;
