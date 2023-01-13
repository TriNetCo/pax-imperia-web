import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../app/UserContext';

const LandingPageOptions = () => {
  const userContext = useContext(UserContext);

  if (userContext.loginStatus == 'logged_in')
    return (
      <div>
        <ul>
          <li><Link to="/about">Singleplayer</Link></li>
          <li><Link to="/new_game">Multiplayer</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/about">Logout</Link></li>
        </ul>
      </div>
    );

  return (
    <div>
      <ul>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </div>
  );
};

export default LandingPageOptions;
