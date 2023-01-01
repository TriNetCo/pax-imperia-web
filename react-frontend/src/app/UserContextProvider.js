import React, { useEffect, useState } from 'react';

import { UserContext } from './UserContext';

export const UserContextProvider = (props) => {

  // const userContext = useContext(UserContext);
  // const { user, setUser } = props.value;
  const [ userContext, setUserContext ] = useState(props.value);

  useEffect( () => {
    // This is working in that it set's the parent's state, but that update is not reflected locally...
    // until this component is re-rendered by the parent following the state change :)

    userContext.initApp();
    userContext.initUser(setUserContext);
    userContext.fillUserInfoFromLocalStorage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <UserContext.Provider value={userContext}>
      {props.children}
    </UserContext.Provider>
  )
}
