# React Frontend

This is the react app.  It imports the javascript library for Pax and loads all of the widgets involved in the game.  We're using react to allow "page navigation" without losing the state of our game widgets.

For notes on content, see [references](references.md).

## Setup

###### For Windows
```
cd frontend
npm link
cd ../react-frontend
npm link pax-imperia-js
npm install

# https://stackoverflow.com/a/46006249/1457383
# To run tests, you might need this, but run with caution as it changes npm settings for the whole machine
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
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

## Usage

###### Setup

```bash
npm install
```

###### Start Server

```bash
npm start
```

###### Run Unit Tests

```bash
npm test
```

###### Deploy to Cloud

```bash
npm run deploy
```
