# Pax Imperia Clone

![pax-imperia-js](https://github.com/trinetco/pax-imperia-clone/actions/workflows/pax-imperia-js.yml/badge.svg)
![react-frontend](https://github.com/trinetco/pax-imperia-clone/actions/workflows/react-frontend.yml/badge.svg)
![backend](https://github.com/trinetco/pax-imperia-clone/actions/workflows/backend.yml/badge.svg)
[WIP Demo](https://trinetco.github.io/pax-imperia-web)

Right now this is a clone of an old game.  But Pax is our benchmark game for an even cooler game built on top of it!  Our roadmap listing completed/ in-progress and planned features is in the [roadmap.md](roadmap.md) file.

## Technical Overview

This project was built with technologies divided across 4 main categories (game library, frontend, backend, and cloud platform):

<pre>
Javascript (game library)
  * Three.JS             - This is the WebGL Framework we're using to render 3D
                           scenes in the browser

Javascript (frontend)
  * React                - This is the SPA framework we're using to build our
                           web application so that state and game rendering
                           components can be managed elegantly (work forced me).

  * Create React App     - This is the React Framework flavor we're using to
                           build our react app so we don't have to get our hands
                           too dirty with js compilation pipelines.

Golang (backend)
  * Gin                   - This is the GoLang web framework we're using for all
                            HTTP endpoints

  * Gorillia              - This is the GoLang websocket toolkit we're using for
                            websocket sessions

  * Liquibase             - Allows us to define our relational database scheme
                            using SQL files and perform updates to our database
                            over time via "migrations"

  * Jet                   - Allows us to import our GoLang data models from the
                            database which is kind of annoying really if we want
                            to learn how to program in GoLang.

  * Postgres              - Allows us to store data if the need should arise...

GCP (cloud platform)
  * Terraform            - Allows us to create resources in the cloud
                           (GCP) by defining them in a markup language and
                           using `terraform apply` to create/ delete cloud
                           resources.  (v 1.3.9)

  * Cloud SQL            - This is our cloud-native database product from GCP

  * Cloud Build          - A product that builds our docker containers and
                           stores them in the cloud.

  * Cloud Run            - A product that hosts our GoLang backend in a very
                           efficient "serverless" manner

  * Firebase Auth        - This is our authentication provider allowing users to
                           Sign in (with their Windows/ xbox accounts currently)
                           without us having to slow down to deal with much
                           authentication logic on the backend.
</pre>

More detailed architectural documentation is located [here](docs/architectural_diagrams.md).

### Technical References

###### WebGL
- Three JS raycaster/ click detection stuff:
- Three JS Sprite stuff:  https://www.youtube.com/watch?v=pGO1Hm-JB90

###### GoLang
- Restful GoLang (skipped):  https://go.dev/doc/tutorial/web-service-gin
- REST using Gin:  https://go.dev/doc/tutorial/web-service-gin
- GoLang Packages: https://go.dev/doc/code
- GoLang Project Layout... https://github.com/golang-standards/project-layout

###### React
- React + WebGL... http://www.petecorey.com/blog/2019/08/19/animating-a-canvas-with-react-hooks/
- React Context?? https://www.freecodecamp.org/news/react-context-for-beginners/#:~:text=React%20context%20caveats-,What%20is%20React%20context%3F,across%20our%20components%20more%20easily.
- Websocket (very regret) https://dev.to/aduranil/how-to-use-websockets-with-redux-a-step-by-step-guide-to-writing-understanding-connecting-socket-middleware-to-your-project-km3
- [Type Hinting](https://dev.to/sumansarkar/how-to-use-jsdoc-annotations-with-vscode-for-intellisense-7co) without the baggage.

###### CSS
- Nesting Flexboxes: https://www.quackit.com/css/flexbox/tutorial/nested_flex_containers.cfm

###### DevX
Opening VS Code:

```
code .vscode/project.code-workspace
```

The workflow went pretty side-ways with this.  It seems like there aren't any extensions out there that support configuring the run and debug settings for the tests, and therefore none really have much monorepo support.  My current workflow involves opening the root of this repo in vscode.  kavod-io.vscode-jest-test-adapter, hbenl.vscode-test-explorer, and the built-in test explorer (I think) will fight over displaying the tests in the test explorer panels.  react-frontend and pax-imperia-js will work, just not within the same pane.  Also, there are three 'run' buttons for running tests by navigating to a specific test.  There's

1. A checkmark in the gutter,
2. A gray 'run' button above the test, and
3. Enigmatically, a second gray 'run' button above the test

For CI/ CD, `npm test` will always work.  I recommend just using the CLI generally.  Good Luck!

- [Multi-root vscode configs](https://medium.com/rewrite-tech/visual-studio-code-tips-for-monorepo-development-with-multi-root-workspaces-and-extension-6b69420ecd12)

### Game Design
Here's some ideas/ brainstorms about the [game design](docs/game_design.md).

### Authentication Info
See [sign_ins](docs/sign_ins.md).

## Getting Started

### Configuration and Secrets
Run the below steps to load the configs into your shell's `~/.bashrc` file:

```
cp .env.sample .env.local
echo "[ -e ${PWD}/.env.local ] && source ${PWD}/.env.local" >> ~/.bashrc
```

Populate `backend/secrets/` and set `export GOOGLE_APPLICATION_CREDENTIALS="${HOME}/dev/game_dev/pax-imperia-clone/backend/secrets/pax-imeria-clone-firebase-adminsdk-b7dfw-1c36eb54cd.json"`.  This file comes from firebase's dashboard instructions for using/ installing service accounts: https://firebase.google.com/docs/admin/setup#go.

TODO: Document using `ln` to pull in the secrets/fullchain.pem and secrets/privkey.pem secrets

### Service Dashboards
This application is hosted using the following third party services:

- This GitHub repo...
- GCP for static hosting and compute: https://console.cloud.google.com
- Azure for auth AD:  https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/4d2c3c6a-9ea2-4e28-b0f4-6c6523ac1e32/objectId/c5d31509-5bb8-4ec0-a3a9-47db79308fe1/isMSAApp~/true/defaultBlade/Overview/appSignInAudience/AzureADandPersonalMicrosoftAccount
- Google for firebase for auth detail smearing:  https://console.firebase.google.com/u/0/project/pax-imeria-clone/settings/general/web:ZDRmYjQzZGItNTJkYy00ZDE1LWE3OWItNjY3MWYxMTA4Yzky

### Launch the system with Docker Compose
All of the microservices can be launched per the `docker-compose.yml` file.

```bash
# Start the backing services in the background
docker compose up --build -d db liquibase
# Rebuild and boot the backend
docker compose build backend frontend && docker compose up backend frontend
```

### Setup the game library
See [pax-imperia-js](pax-imperia-js/README.md).

### Setup the GoLang Backend
See [backend](backend/README.md).

### Setup the react app
See [react-frontend](react-frontend/README.md).

### Cloud Deployment Stuff
Check out the [cloud docs](cloud_infrastructure/README.md).
