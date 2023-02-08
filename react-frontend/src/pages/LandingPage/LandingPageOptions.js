import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../app/UserContext';
import { spoofSignIn } from '../DebugPage/webToolHelpers';

const LandingPageOptions = () => {
  const userContext = useContext(UserContext);

  const handleLoginAsGuest = () => {
    spoofSignIn();
    userContext.fillUserInfoFromLocalStorage();
  };

  const handleLogout = () => {
    userContext.logout();
  };

  if (userContext.loginStatus == 'logged_in')
    return (
      <div>
        <ul>
          <li><Link to="/systems">Singleplayer</Link></li>
          <li><Link to="/new_game">Multiplayer</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
    );

  return (
    <div>
      <ul>
        <li><Link to="/login">Login</Link></li>
        <li><button onClick={handleLoginAsGuest}>(Dev) Login as Guest</button></li>
        <li><Link to="/debug">(Dev) Debug Page</Link></li>
      </ul>
    </div>
  );
};

export default LandingPageOptions;
