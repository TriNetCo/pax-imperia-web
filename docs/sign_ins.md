# Sign Ins (OAuth and Firebase)

For Sign-ins we're using Firbase Auth as our frontend javascript library, and back-end GoLang library since someone at work started a PR with Firebase.  We support microsoft as our sign-in provider (which is great since MS Games/ xbox live accounts use MS).  We should additionally be able to support github and steam as an identity providers which feels like the right choice for a game.

###### Azure App Registration (Wa)
The Azure dashboard is used to create an "App Registration" in Azure.  It's really Janky registering an app so the link to view and edit it must be saved to the readme.  A secret is created in the Azure App Registration and Authentication (via web using both "Access Tokens" as well as "ID Tokens").  The `*.firebaseapp.com/__/auth/handler` redirect uri from firebase get's configured here in Azure.  A Client secret must be generated in Azure so that it and the "Application (client) ID" can be copied into the firebase dashboard. Firebase documents it [here](https://firebase.google.com/docs/auth/web/microsoft-oauth) which links to MS docs [here](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).

###### Firebase Project Creation (Ve)
Firebase's dashboard is used to create our project and Azure AD is enabled as an auth mechanism.  We copy the client secret and client ID from azure to make the authentication integration function correctly.

###### Authentication Process
Using the firebase library, the JS client redirects the user to firebase's Azure AD auth extension.  From there, firebase forwards the auth request to Azure and Azure responds with a signed JWT token.  Firebase fowards this to our react front end upon redirect back to our application's login page.  Our app will now be able to look up the OAuth token via `auth.currentUser.getIdToken(true).then(idToken => { console.log(idToken) });`.  This token is passed to our backend which validates that the token is an authentically signed Azure token.  Our backend takes the email information from the JWT token to associate the user with our backend.  A table named `users` will include this email along with any roles this user may have (admin?).

###### Firebase Bugs
There is currently a bug where firebase doesn't work with multiple tabs so good on Macs.  It has to do with their hacks for channeling messages between a cross-origin iframe and the main window using IndexedDB.  To work around this, the `upload_firebase_helpers.sh` script is used which uploads some important snippets to the domain name.  React must use this domain as the authdomain instead of the default `PROJECT_ID.firebaseapp.com` domain so that in production, iframes are never cross-origin and don't require special hacks to enable communication between processes.
