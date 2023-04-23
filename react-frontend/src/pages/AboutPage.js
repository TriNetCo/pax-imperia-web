import { Link } from 'react-router-dom';
import UserCard from 'src/shared/UserCard/UserCard';

const AboutPage = () => {
  return (
    <>

      <div className="page-wrap">
        <div id="generic-app-parent" className="title-screen">
          <div className="wrap-block"></div>
          <UserCard />

          <div className="about-well">

            <h1>About Pax Imperia Clone</h1>
            <div>
              <p>
          Pax Imperia Clone is a web-based remake of a 1997 space empire
          building game (please excuse the slightly dated layout).
              </p>
              <p>
          This is a hobby project a group of friends (TriNetCo) have been
          working on to play with some of the devops, data science, project
          management, and game development practices they've acquired over
          the years.
              </p>
              <p>
          To no one's surprise, the development spanned longer
          than the month where we budgeted the bulk of the development work
          and so below you'll find a humble listing of our current degree of
          success.
              </p>
              <ul>
                <li>Automated deployment of Infrastructure to Google Cloud</li>
                <li>Local, container-based development tooling</li>
                <li>Frontend intergration with OAuth via  Microsoft Azure IDP (per Firebase)</li>
                <li>A solar system generator</li>
                <li>The initial WebGL prototype for doing the solar system view</li>
                <li>A datamodel for managing state in the game to support multiplayer</li>
                <li>A great backlog that isn't daunting at all!</li>
                <li>Update: added a <Link to="/">back</Link> button to this page.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

    </>
  );
};

export default AboutPage;
