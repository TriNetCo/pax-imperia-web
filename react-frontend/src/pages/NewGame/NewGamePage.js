import { Link } from 'react-router-dom';

const NewGamePage = () => {
  return (
    <>
      <h1>NewGame Page</h1>
      <div>
        <div>
          TODO:  Create a breadcrumb style UI that allows people to generate the game data and start playing.
        </div>
        <div>
          For now, just navigate through the links to create a game...
        </div>
        <Link to='/new_game/colonizer_config'>ColonizerConfigPage</Link>
      </div>
    </>
  );
};

export default NewGamePage;
