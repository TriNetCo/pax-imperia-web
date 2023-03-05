import React, { useState } from 'react';
import PropTypes from 'prop-types';
import UserContext from './UserContext';
import { createUserContext } from './UserContext';


export const UserContextProvider = ({ children, azureAuth }) => {
  const [ userContext, setUserContext ] = useState(createUserContext({azureAuth}));

  // We use this method as opposed to useEffect which has an issue where the useEffect's resolved in opposite the order we want
  const initUserContext = () => {
    if (!userContext.initialized) {
      console.debug('UserContextProvider: Initial Render');
      userContext.initUser(setUserContext);
      userContext.fillUserInfoFromLocalStorage();
    }

    return userContext;
  };

  return (
    <UserContext.Provider value={initUserContext()}>
      {children}
    </UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
  azureAuth: PropTypes.object.isRequired,
};
