# Pax Imperia Clone

A clone of an old game.  The arcitecture is [here](architectural_diagrams.md).  Pax is our benchmark game for an even cooler game built on top of it!!!  Here's some ideas/ brainstorms about the [game design](game_design.md).



## Overview

This project was built with 3 main technologies:

- Golang (backend)      - Handles all of the communication between the frontend clients over http and websockets.
- Javascript (frontend) - Handles all of the graphics on the front end as well as plenty of game logic.
- Postgres   - Allows us to store data if the need should arise...

The backend's data models are created from the postgres database (resume driven design) using "Jet".

## Getting Started...

## Secrets and Configs

Add something like this to your shell:

```
source ~/dev/game_dev/pax-imperia-clone/.env.local
```

Populate `backend/secrets/` and set `export GOOGLE_APPLICATION_CREDENTIALS="${HOME}/dev/game_dev/pax-imperia-clone/backend/secrets/pax-imeria-clone-firebase-adminsdk-b7dfw-1c36eb54cd.json"`.  This file comes from firebase's dashboard instructions for using/ installing service accounts: https://firebase.google.com/docs/admin/setup#go.

TODO: Document using `ln` to pull in the secrets/fullchain.pem and secrets/privkey.pem secrets

### Build Database

go install github.com/go-jet/jet/v2/cmd/jet@latest

```
jet -source=postgres -host=localhost -port=5432 -user="${GO_DB_USER}" -password=ez -dbname=dbmodels -schema=pax -sslmode=disable
```

### Boot the GO App

Run these commands to start the server

Prerequisite on Macbook:

```
cd frontend
npm install
```

```
cd backend
go run cmd/pax.go
```

Now navigate to [http://localhost:3000](http://localhost:3000) to play the game!

The main file to edit is of course `./public/index.html` for getting at the front end at the moment.

### Setup the react app

###### For Windows
```
cd frontend
npm link
cd ../react-frontend
npm link pax-imperia-js
npm install
```

###### For Mac
```
cd react-frontend
npm install
```

### Run the react server

```
cd react-frontend
npm start
```

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

