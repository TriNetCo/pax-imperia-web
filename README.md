# Pax Imperia Clone

A clone of an old game.  The architecture is [here](architectural_diagrams.md).  Pax is our benchmark game for an even cooler game built on top of it!!!  Here's some ideas/ brainstorms about the [game design](game_design.md).


## Technical Overview

This project was built with technologies divided across 3 main categories (frontend, backend, and cloud platform):

<pre>
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

Javascript (frontend)
  * Three.JS             - This is the WebGL Framework we're using to render 3D
                           scenes in the browser

  * React                - This is the SPA framework we're using to build our
                           web application so that state and game rendering
                           components can be managed elegantly (work forced me).

  * Create React App     - This is the React Framework flavor we're using to
                           build our react app so we don't have to get our hands
                           too dirty with js compilation pipelines.

GCP (cloud platform)
  * Terraform            - Allows us to create resources in the cloud
                           (GCP) by defining them in a markup language and
                           using `terraform apply` to create/ delete cloud
                           resources.

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


## Getting Started

### Configuration and Secrets

Run the below steps to load the configs into your shell's `~/.bashrc` file:

```
cp .env.sample .env.local
echo "[ -e ${PWD}/.env.local ] && source ${PWD}/.env.local" >> ~/.bashrc
```

Populate `backend/secrets/` and set `export GOOGLE_APPLICATION_CREDENTIALS="${HOME}/dev/game_dev/pax-imperia-clone/backend/secrets/pax-imeria-clone-firebase-adminsdk-b7dfw-1c36eb54cd.json"`.  This file comes from firebase's dashboard instructions for using/ installing service accounts: https://firebase.google.com/docs/admin/setup#go.

TODO: Document using `ln` to pull in the secrets/fullchain.pem and secrets/privkey.pem secrets

### Launch the system with Docker Compose

All of the microservices can be launched per the `docker-compose.yml` file.

```bash
# Start the backing services in the background
docker compose up --build -d db liquibase
# Rebuild and boot the backend
docker compose build backend frontend && docker compose up backend frontend
```

### Setup the GoLang Backend
See [backend](backend/README.md).

### Setup the react app
See [react-frontend](react-frontend/README.md).

## Dashboards

- Azure for auth AD:  https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/4d2c3c6a-9ea2-4e28-b0f4-6c6523ac1e32/objectId/c5d31509-5bb8-4ec0-a3a9-47db79308fe1/isMSAApp~/true/defaultBlade/Overview/appSignInAudience/AzureADandPersonalMicrosoftAccount
- Google for firebase for auth detail smearing:  https://console.firebase.google.com/u/0/project/pax-imeria-clone/settings/general/web:ZDRmYjQzZGItNTJkYy00ZDE1LWE3OWItNjY3MWYxMTA4Yzky


## Authentication Info

###### Azure App Registration
The Azure dashboard is used to create an "App Registration" in Azure.  It's really Janky registering an app so the link to view and edit it must be saved to the readme.  A secret is created in the Azure App Registration and Authentication (via web using both "Access Tokens" as well as "ID Tokens").  The `*.firebaseapp.com/__/auth/handler` redirect uri from firebase get's configured here in Azure.  A Client secret must be generated in Azure so that it and the "Application (client) ID" can be copied into the firebase dashboard. Firebase documents it [here](https://firebase.google.com/docs/auth/web/microsoft-oauth) which links to MS docs [here](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).

###### Firebase Project Creation
Firebase's dashboard is used to create our project and Azure AD is enabled as an auth mechanism.  We copy the client secret and client ID from azure to make the authentication integration function correctly.

###### Authentication Process
Using the firebase library, the JS client redirects the user to firebase's Azure AD auth extension.  From there, firebase forwards the auth request to Azure and Azure responds with a signed JWT token.  Firebase fowards this to our react front end upon redirect back to our application's login page.  Our app will now be able to look up the OAuth token via `auth.currentUser.getIdToken(true).then(idToken => { console.log(idToken) });`.  This token is passed to our backend which validates that the token is an authentically signed Azure token.  Our backend takes the email information from the JWT token to associate the user with our backend.  A table named `users` will include this email along with any roles this user may have (admin?).

## Cloud Deployment Stuff

Check out the [cloud docs](cloud_infrastructure/README.md).


## References

- Three JS raycaster/ click detection stuff:
- Three JS Sprite stuff:  https://www.youtube.com/watch?v=pGO1Hm-JB90
- Restful GoLang (skipped):  https://go.dev/doc/tutorial/web-service-gin
- REST using Gin:  https://go.dev/doc/tutorial/web-service-gin
- GoLang Packages: https://go.dev/doc/code
- GoLang Project Layout... https://github.com/golang-standards/project-layout
- React + WebGL... http://www.petecorey.com/blog/2019/08/19/animating-a-canvas-with-react-hooks/
- React Context?? https://www.freecodecamp.org/news/react-context-for-beginners/#:~:text=React%20context%20caveats-,What%20is%20React%20context%3F,across%20our%20components%20more%20easily.
