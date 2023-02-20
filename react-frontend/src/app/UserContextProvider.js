import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from './UserContext';

export const UserContextProvider = ({ children, value }) => {
  const [ userContext, setUserContext ] = useState(value);

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
  value: PropTypes.object.isRequired,
};
