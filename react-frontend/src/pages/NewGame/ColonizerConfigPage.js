import { useHistory } from 'react-router-dom';
import NewGameBreadCrumb from './NewGameBreadCrumb';

const ColonizerConfigPage = () => {
  const history = useHistory();

  const handleDefaultClick = () => {
    alert('TODO: Populate the colonizer game data here...');
    history.push('/new_game/galaxy_config');
  };

  return (
    <>
      <h1>ColonizerConfig Page</h1>
      <button onClick={handleDefaultClick}>Choose default telepathic species</button>
    </>
  );
};

export default ColonizerConfigPage;
