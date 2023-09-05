# Pax Imperia JS

This is the core WebGL library that powers the game.  All the models and graphical assets are tracked here.  The WebGL logic is exposed as "widgets" which generally render a 3D scene to an HTML canvas.  In contrast, the `react-frontend` folder is the Single Page Application (SPA) framework used for weaving all the canvas widgets defined here.

## Make sure you're in the correct subfolder

```
cd pax-imperia-js
```

## Setup Dependencies

```
npm install
```

## Run tests

Tests were such a pain but this [stack overflow](https://stackoverflow.com/questions/60372790/node-v13-jest-es6-native-support-for-modules-without-babel-or-esm) explained almost all of it:

```
npm test
```

