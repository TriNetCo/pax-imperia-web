import Galaxy from '../../features/galaxy/Galaxy';

const GalaxyConfigPage = () => {

  return (
    <>
      <h1>GalaxyConfig Page</h1>

      <div>
        <div>System: <span id="system-name"></span></div>
        <div id="lower-console"></div>

        <Galaxy />

      </div>

      <button>Re-Generate System</button>
      <div>
        TODO:  Add slider bars and cool stuff to this page!!!
      </div>
    </>
  );
};

export default GalaxyConfigPage;
