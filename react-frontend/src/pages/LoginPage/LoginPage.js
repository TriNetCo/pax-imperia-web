import React, { useContext } from 'react';
import UserContext from '../../app/UserContext';
import UserCard from 'src/shared/UserCard/UserCard';

import {
    CircularProgress
} from '@mui/material';

import { Link } from 'react-router-dom';

let renderCount = 0;
export default function LoginPage() {
    renderCount++;
    const userContext = useContext(UserContext);

    const handleLogin = () => {
        userContext.login();
    };

    const handleLogout = () => {
        userContext.logout();
    };

    const handleShow = _ => {
        console.log(userContext.token);
    };

    const LogoutButton = () => {
        return <button className="ml-auto" onClick={() => handleLogout()}>Sign out</button>;
    };

    const LoginButton = () => {
        return <button className="ml-auto" onClick={handleLogin}>Sign in using Redirect</button>;
    };

    const ShowTokenButton = () => {
        return <button className="ml-auto" onClick={() => handleShow()}>Show Token</button>;
    };

    const UserDetails = () => {
        return (
            <div>
                {
                    userContext.loginStatus === 'pending' ?
                        <CircularProgress />
                        :
                        userContext.loginStatus === 'logged_in' ?
                            <>username: { userContext.displayName }</>
                            :
                            <></>
                }
            </div>
        );
    };

    const handleShowContext = () => {
        console.log('DisplayName: ' + userContext.displayName);
    };

    const handleChangeStateState = (state) => {
        userContext.loginStatus = state;
    };

    return (
        <>
            <UserCard />
            <div>
                { userContext.loginStatus === 'logged_in' ?
                    'Logged In' :
                    userContext.loginStatus === 'logged_out' ?
                        'Logged Out' :
                        'Login Pending'
                }
            </div>

            <UserDetails/>

            { userContext.loginStatus === 'logged_in' ?
                <LogoutButton/> :
                <LoginButton/>
            }

            <ShowTokenButton/>

            <div>Login status is: &quot;{ userContext.loginStatus }&quot; </div>
            <button onClick={() => handleChangeStateState('logged_out')}>Change to logged_out</button>
            <button onClick={() => handleChangeStateState('pending')}>Change to pending</button>
            <button onClick={() => handleChangeStateState('logged_in')}>Change to logged_in</button>

            <button className="ml-auto" onClick={handleShowContext}>Show Context</button>

            <div>
                <Link to='/'>Main Menu</Link>
            </div>
            <div>
                <Link to='/debug'>Debug Page</Link>
            </div>

            <div>renderCount: {renderCount}</div>
        </>
    );
}
