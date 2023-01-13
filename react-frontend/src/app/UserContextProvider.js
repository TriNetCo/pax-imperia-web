import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from './UserContext';

export const UserContextProvider = ({ children, value }) => {

  // const userContext = useContext(UserContext);
  // const { user, setUser } = value;
  const [ userContext, setUserContext ] = useState(value);

  useEffect( () => {
    // This is working in that it set's the parent's state, but that update is not reflected locally...
    // until this component is re-rendered by the parent following the state change :)

    userContext.initApp();
    userContext.initUser(setUserContext);
    userContext.fillUserInfoFromLocalStorage();
  }, []);

  return (
    <UserContext.Provider value={userContext}>
      {children}
    </UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
  value: PropTypes.object.isRequired,
};
